import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Bench } from "tinybench";
import * as acorn from "acorn";
import * as babel from "@babel/parser";
import * as oxc from "oxc-parser";
import swc from "@swc/core";
import type { ParseOptions as SwcParseOptions } from "@swc/types";
import { parse as yukuParseSync, type SourceLang } from "yuku-parser";

const FILES: Record<string, { path: string; lang: SourceLang }> = {
  typescript: { path: "files/typescript.js", lang: "js" },
  checker: { path: "files/checker.ts", lang: "ts" },
  react: { path: "files/react.js", lang: "js" },
};

const BENCH_TIME = Number(process.env.BENCH_TIME ?? 10000);
const BENCH_WARMUP = Number(process.env.BENCH_WARMUP ?? 2000);
const BENCH_RUNS = Number(process.env.BENCH_RUNS ?? 3);

interface RunResult {
  name: string;
  mean: number;
  min: number;
  max: number;
  median: number;
  stddev: number;
  rme: number;
  samples: number;
}

interface BenchResult extends RunResult {
  runs: number;
}

interface FileResult {
  file: string;
  results: BenchResult[];
}

function parserNamesFor(lang: SourceLang): string[] {
  const isTs = lang === "ts" || lang === "tsx";
  return isTs
    ? ["Babel", "Oxc", "SWC", "Yuku"]
    : ["Acorn", "Babel", "Oxc", "SWC", "Yuku"];
}

function createParserTasks(source: string, lang: SourceLang): Record<string, () => void> {
  const isTs = lang === "ts" || lang === "tsx";
  const isJsx = lang === "tsx";
  const tasks: Record<string, () => void> = {};

  if (!isTs) {
    tasks.Acorn = () => {
      const { body: _ } = acorn.parse(source, { ecmaVersion: "latest", sourceType: "module" });
    };
  }

  const babelPlugins: babel.ParserPlugin[] = [];
  if (isTs) babelPlugins.push("typescript");
  if (isJsx) babelPlugins.push("jsx");
  tasks.Babel = () => {
    const { program: _ } = babel.parse(source, {
      sourceType: "module",
      plugins: babelPlugins,
      errorRecovery: isTs,
    });
  };

  const oxcFilename = isJsx ? "bench.tsx" : isTs ? "bench.ts" : "bench.js";
  tasks.Oxc = () => {
    const { program: _ } = oxc.parseSync(oxcFilename, source);
  };

  const swcSyntax: SwcParseOptions = isTs
    ? { syntax: "typescript", tsx: isJsx }
    : { syntax: "ecmascript" };
  tasks.SWC = () => {
    const { body: _ } = swc.parseSync(source, swcSyntax);
  };

  const yukuOptions = lang === "js" ? undefined : { lang };
  tasks.Yuku = () => {
    const { program: _ } = yukuParseSync(source, yukuOptions);
  };

  return tasks;
}

// Child mode: benchmark a single parser against a single file in a fresh
// process, so JIT state and GC pressure from one parser never affect another.
// Emits a single JSON object on stdout, all logging goes to stderr.

async function runTask(fileKey: string, parserName: string): Promise<void> {
  const file = FILES[fileKey];
  if (!file) throw new Error(`Unknown file: ${fileKey}`);

  const source = await readFile(join(process.cwd(), file.path), "utf-8");
  const tasks = createParserTasks(source, file.lang);
  const fn = tasks[parserName];
  if (!fn) throw new Error(`Parser ${parserName} does not support ${fileKey}`);

  const bench = new Bench({ time: BENCH_TIME, warmupTime: BENCH_WARMUP });
  bench.add(parserName, fn);
  await bench.run();

  const task = bench.tasks[0];
  if (!task?.result || task.result.state !== "completed") {
    process.stdout.write(JSON.stringify({ ok: false }));
    return;
  }

  const latency = task.result.latency;
  const result: RunResult = {
    name: parserName,
    mean: latency.mean,
    min: latency.min,
    max: latency.max,
    median: latency.p50,
    stddev: latency.sd,
    rme: latency.rme,
    samples: latency.samplesCount,
  };
  process.stdout.write(JSON.stringify({ ok: true, result }));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function aggregateRuns(name: string, runs: RunResult[]): BenchResult {
  return {
    name,
    mean: median(runs.map((r) => r.mean)),
    min: Math.min(...runs.map((r) => r.min)),
    max: Math.max(...runs.map((r) => r.max)),
    median: median(runs.map((r) => r.median)),
    stddev: median(runs.map((r) => r.stddev)),
    rme: median(runs.map((r) => r.rme)),
    samples: runs.reduce((sum, r) => sum + r.samples, 0),
    runs: runs.length,
  };
}

async function benchFile(
  fileKey: string,
  file: { path: string; lang: SourceLang },
): Promise<FileResult> {
  console.log(`\nBenchmarking ${fileKey}...`);

  const results: BenchResult[] = [];
  for (const name of parserNamesFor(file.lang)) {
    const runs: RunResult[] = [];
    for (let run = 1; run <= BENCH_RUNS; run++) {
      console.log(`  ${name} (run ${run}/${BENCH_RUNS})`);
      const proc = Bun.spawnSync({
        cmd: [process.execPath, "scripts/bench.ts", "--task", fileKey, name],
        stdout: "pipe",
        stderr: "inherit",
      });
      if (proc.exitCode !== 0) {
        console.error(`  ${name} run ${run} failed with exit code ${proc.exitCode}`);
        continue;
      }
      const out = JSON.parse(proc.stdout.toString()) as { ok: boolean; result?: RunResult };
      if (out.ok && out.result) runs.push(out.result);
      else console.error(`  ${name} run ${run} did not complete`);
    }
    if (runs.length > 0) results.push(aggregateRuns(name, runs));
  }

  results.sort((a, b) => a.median - b.median);
  console.table(
    results.map((r) => ({
      Parser: r.name,
      "Median (ms)": r.median.toFixed(3),
      "±RME": `${r.rme.toFixed(2)}%`,
      Samples: r.samples,
      Runs: r.runs,
    })),
  );

  return { file: fileKey, results };
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--task") {
    const [, fileKey, parserName] = args;
    if (!fileKey || !parserName) throw new Error("Usage: bench.ts --task <file> <parser>");
    await runTask(fileKey, parserName);
    return;
  }

  const filesToBench =
    args.length > 0
      ? Object.entries(FILES).filter(([key]) => args.includes(key))
      : Object.entries(FILES);

  await mkdir(join(process.cwd(), "result"), { recursive: true });

  for (const [key, file] of filesToBench) {
    const result = await benchFile(key, file);
    await writeFile(join(process.cwd(), "result", `${key}.json`), JSON.stringify(result, null, 2));
  }

  console.log("\nBenchmark complete!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

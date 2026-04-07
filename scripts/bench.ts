import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Bench } from "tinybench";
import * as acorn from "acorn";
import * as babel from "@babel/parser";
import * as oxc from "oxc-parser";
import swc from "@swc/core";
import { parse as hermesParse } from "hermes-parser";
import { parseSync as yukuParseSync } from "yuku-parser";

const FILES: Record<string, string> = {
  typescript: "files/typescript.js",
  three: "files/three.js",
  react: "files/react.js",
};

interface BenchResult {
  name: string;
  mean: number;
  min: number;
  max: number;
  median: number;
  stddev: number;
  samples: number;
}

interface FileResult {
  file: string;
  results: BenchResult[];
}

async function benchFile(fileKey: string, filePath: string): Promise<FileResult> {
  const source = await readFile(join(process.cwd(), filePath), "utf-8");

  const bench = new Bench({ time: 5000, warmupTime: 1000 });

  bench.add("Acorn", () => {
    const { body: _ } = acorn.parse(source, { ecmaVersion: "latest", sourceType: "module" });
  });

  bench.add("Babel", () => {
    const { program: _ } = babel.parse(source, { sourceType: "module" });
  });

  bench.add("Hermes", () => {
    const { body: _ } = hermesParse(source, { sourceType: "module" });
  });

  bench.add("Oxc", () => {
    const { program: _ } = oxc.parseSync("bench.js", source);
  });

  bench.add("SWC", () => {
    const { body: _ } = swc.parseSync(source, { syntax: "ecmascript" });
  });

  bench.add("Yuku", () => {
    const { program: _ } = yukuParseSync(source);
  });

  console.log(`\nBenchmarking ${fileKey}...`);
  await bench.run();

  console.table(bench.table());

  const results: BenchResult[] = [];
  for (const task of bench.tasks) {
    if (!task.result || task.result.state !== "completed") continue;
    results.push({
      name: task.name,
      mean: task.result.latency.mean,
      min: task.result.latency.min,
      max: task.result.latency.max,
      median: task.result.latency.p50,
      stddev: task.result.latency.sd,
      samples: task.result.latency.samplesCount,
    });
  }

  return { file: fileKey, results };
}

async function main() {
  const targetFiles = process.argv.slice(2);
  const filesToBench = targetFiles.length > 0
    ? Object.entries(FILES).filter(([key]) => targetFiles.includes(key))
    : Object.entries(FILES);

  await mkdir(join(process.cwd(), "result"), { recursive: true });

  for (const [key, path] of filesToBench) {
    const result = await benchFile(key, path);
    await writeFile(
      join(process.cwd(), "result", `${key}.json`),
      JSON.stringify(result, null, 2),
    );
  }

  console.log("\nBenchmark complete!");
}

main().catch(console.error);

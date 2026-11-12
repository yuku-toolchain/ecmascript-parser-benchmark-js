import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { arch, cpus, platform, release, totalmem } from "node:os";
import { join } from "node:path";

const FILES_SOURCE_URL_PREFIX =
  "https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main";

const PARSERS = {
  acorn: {
    name: "Acorn",
    description: "A tiny, fast JavaScript parser, written completely in JavaScript.",
    url: "https://github.com/acornjs/acorn",
  },
  babel: {
    name: "Babel",
    description: "A JavaScript compiler and parser used by the Babel toolchain.",
    url: "https://github.com/babel/babel/tree/main/packages/babel-parser",
  },
  oxc: {
    name: "Oxc",
    description: "A high-performance JavaScript and TypeScript parser written in Rust.",
    url: "https://github.com/oxc-project/oxc",
  },
  swc: {
    name: "SWC",
    description:
      "An extensible Rust-based platform for compiling and bundling JavaScript and TypeScript.",
    url: "https://github.com/swc-project/swc",
  },
  swc_next: {
    name: "SWC Next",
    description: "The next-generation SWC JavaScript and TypeScript parser.",
    url: "https://github.com/swc-project/swc-next",
  },
  yuku: {
    name: "Yuku",
    description:
      "A high-performance & spec-compliant JavaScript/TypeScript compiler written in Zig.",
    url: "https://github.com/yuku-toolchain/yuku",
  },
} as const;

const CHART_COLORS: Record<string, string> = {
  acorn: "#4CC9F0",
  babel: "#7209B7",
  oxc: "#F72585",
  swc: "#3A86FF",
  swc_next: "#2DBD85",
  yuku: "#FF6B35",
};

const NAME_TO_KEY: Record<string, string> = {
  Acorn: "acorn",
  Babel: "babel",
  Oxc: "oxc",
  SWC: "swc",
  "SWC Next": "swc_next",
  Yuku: "yuku",
};

const FILES = {
  typescript: {
    path: "files/typescript.js",
    source_url: `${FILES_SOURCE_URL_PREFIX}/typescript.js`,
  },
  checker: {
    path: "files/checker.ts",
    source_url: `${FILES_SOURCE_URL_PREFIX}/checker.ts`,
  },
  lib_dom: {
    path: "files/lib.dom.d.ts",
    source_url: `${FILES_SOURCE_URL_PREFIX}/lib.dom.d.ts`,
  },
  react: {
    path: "files/react.js",
    source_url: `${FILES_SOURCE_URL_PREFIX}/react.js`,
  },
} as const;

type FileKey = keyof typeof FILES;

interface BenchResult {
  name: string;
  mean: number;
  min: number;
  max: number;
  median: number;
  stddev: number;
  rme?: number;
  samples: number;
  runs?: number;
}

interface FileResult {
  file: string;
  results: BenchResult[];
}

interface ParserEntry {
  key: string;
  name: string;
  result: BenchResult | null;
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(ms: number): string {
  return `${ms.toFixed(2)} ms`;
}

function formatOps(medianMs: number): string {
  const ops = 1000 / medianMs;
  return `${ops.toFixed(2)} ops/s`;
}

function formatRme(rme: number | undefined): string {
  return rme != null ? `±${rme.toFixed(2)}%` : "-";
}

async function readBenchmarkResults(fileKey: FileKey): Promise<FileResult> {
  const content = await readFile(join(process.cwd(), "result", `${fileKey}.json`), "utf-8");
  return JSON.parse(content) as FileResult;
}

function getParserEntries(data: FileResult): ParserEntry[] {
  const resultsByKey = new Map<string, BenchResult>();
  for (const result of data.results) {
    const key = NAME_TO_KEY[result.name];
    if (key) resultsByKey.set(key, result);
  }

  const entries: ParserEntry[] = [];
  for (const [key, parser] of Object.entries(PARSERS)) {
    entries.push({ key, name: parser.name, result: resultsByKey.get(key) ?? null });
  }

  entries.sort((a, b) => {
    if (a.result && b.result) return a.result.median - b.result.median;
    if (a.result && !b.result) return -1;
    if (!a.result && b.result) return 1;
    return 0;
  });

  return entries;
}

function textWidth(text: string): number {
  let em = 0;
  for (const c of text) em += /[fijlrt\-. ]/.test(c) ? 0.35 : /[A-Zmw]/.test(c) ? 0.75 : 0.58;
  return Math.ceil(em * 13);
}

async function generateChart(entries: ParserEntry[], chartName: string): Promise<string> {
  const data = entries.filter((e) => e.result != null);
  if (data.length === 0) return "";

  const width = 640;
  const barX = Math.max(...data.map((e) => textWidth(e.name))) + 10;
  const fastest = Math.min(...data.map((e) => e.result!.median));
  const slowest = Math.max(...data.map((e) => e.result!.median));
  const rows = data.map(({ key, name, result }, index) => {
    const { median } = result!;
    const y = index * 30;
    const middle = y + 11;
    const barEnd = barX + Math.round((median / slowest) * (width - barX - 80));
    const row = [
      `<text x="${barX - 10}" y="${middle}" text-anchor="end">${name}</text>`,
      `<rect x="${barX}" y="${y}" width="${barEnd - barX}" height="22" rx="4" fill="${CHART_COLORS[key]}"/>`,
      `<text x="${barEnd + 8}" y="${middle}">${formatTime(median)}</text>`,
    ];
    if (median !== fastest) {
      const ratio = `${(median / fastest).toFixed(2)}×`;
      row.push(`<text class="ratio" x="${barEnd - 8}" y="${middle}" text-anchor="end">${ratio}</text>`);
    }
    return row.join("\n  ");
  });

  const height = data.length * 30 - 8;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    text { font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; fill: #848d97; dominant-baseline: central; font-variant-numeric: tabular-nums }
    .ratio { font-size: 12px; fill: #fff }
  </style>
  ${rows.join("\n  ")}
</svg>
`;

  await mkdir(join(process.cwd(), "charts"), { recursive: true });
  await writeFile(join(process.cwd(), "charts", `${chartName}.svg`), svg);
  return `charts/${chartName}.svg`;
}

function generateTable(entries: ParserEntry[]): string {
  const lines: string[] = [];

  const fastest = entries.find((e) => e.result != null)?.result ?? null;

  lines.push("| Parser | Median | RME | Mean | Min | Max | Ops/sec | Relative |");
  lines.push("|--------|--------|-----|------|-----|-----|---------|----------|");

  for (const { name, result } of entries) {
    if (!result) {
      lines.push(`| ${name} | Failed to parse | - | - | - | - | - | - |`);
      continue;
    }
    const isFastest = result === fastest;
    const ratio = fastest ? result.median / fastest.median : 1;
    const relative = isFastest ? "baseline" : `${ratio.toFixed(2)}× slower`;
    const cells = [
      name,
      formatTime(result.median),
      formatRme(result.rme),
      formatTime(result.mean),
      formatTime(result.min),
      formatTime(result.max),
      formatOps(result.median),
      relative,
    ];
    const row = isFastest ? cells.map((c) => `**${c}**`).join(" | ") : cells.join(" | ");
    lines.push(`| ${row} |`);
  }

  return lines.join("\n");
}

async function generateBenchmarksSection(): Promise<string> {
  const lines = ["## Benchmarks", ""];

  for (const [key, file] of Object.entries(FILES)) {
    const fileKey = key as FileKey;
    const fileName = file.path.split("/").pop()!;
    const fileSize = (await stat(join(process.cwd(), file.path))).size;
    const data = await readBenchmarkResults(fileKey);
    const entries = getParserEntries(data);

    lines.push(`### [${fileName}](${file.source_url})`);
    lines.push("");
    lines.push(`**File size:** ${formatBytes(fileSize)}`);
    lines.push("");

    const chartPath = await generateChart(entries, fileKey);
    if (chartPath) {
      lines.push(`![Bar chart comparing npm parser speeds for ${fileName}](${chartPath})`);
      lines.push("");
    }

    lines.push(generateTable(entries));
    lines.push("");
  }

  return lines.join("\n");
}

function generateParsersSection(): string {
  const lines = ["## Parsers", ""];

  for (const [, parser] of Object.entries(PARSERS)) {
    lines.push(`### [${parser.name}](${parser.url})`);
    lines.push("");
    lines.push(parser.description);
    lines.push("");
  }

  return lines.join("\n");
}

function getSystemInfo(): string {
  const cpu = cpus()[0];
  const cpuModel = cpu?.model || "Unknown CPU";
  const cpuCores = cpus().length;
  const totalMemoryGB = (totalmem() / (1024 * 1024 * 1024)).toFixed(0);
  const os = platform();
  const osArch = arch();
  const osRelease = release();
  const osName =
    os === "darwin" ? "macOS" : os === "win32" ? "Windows" : os === "linux" ? "Linux" : os;

  return `## System

| Property | Value |
|----------|-------|
| OS | ${osName} ${osRelease} (${osArch}) |
| CPU | ${cpuModel} |
| Cores | ${cpuCores} |
| Memory | ${totalMemoryGB} GB |`;
}

function generateRunSection(): string {
  return `## Run Benchmarks

### Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager

### Steps

1. Clone the repository:

\`\`\`bash
git clone https://github.com/yuku-toolchain/ecmascript-parser-benchmark-js.git
cd ecmascript-parser-benchmark-js
\`\`\`

2. Install dependencies:

\`\`\`bash
bun install
\`\`\`

3. Download the benchmark files:

\`\`\`bash
bun load-files
\`\`\`

4. Run benchmarks:

\`\`\`bash
bun bench
\`\`\`

This will run benchmarks on all test files. Results are saved to the \`result/\` directory.

Benchmark duration is configurable via the environment variables \`BENCH_TIME\` (timed duration per run in ms, default 10000), \`BENCH_WARMUP\` (warmup duration in ms, default 2000), and \`BENCH_RUNS\` (independent runs per parser, default 3). For the most stable numbers, run on AC power with no other applications running.`;
}

function generateMethodologySection(): string {
  return `## Methodology

Each parser is benchmarked using [Tinybench](https://github.com/tinylibs/tinybench) with warmup iterations followed by multiple timed runs. Each run measures the time to parse the source text into an AST. Source files are read from disk once and kept in memory for all iterations.

To keep results stable and fair, every parser × file combination runs in its own freshly spawned process, so JIT state and GC pressure from one parser never affect another. Each combination is benchmarked in multiple independent runs (3 by default), and the reported median is the median across those runs, a statistic that is robust to GC pauses, OS scheduling blips, and other outliers. The RME column shows the relative margin of error (99% confidence) within a run. Differences between parsers smaller than their combined margins should be treated as noise.

Native parsers (Oxc, SWC, SWC Next, Yuku) run through their respective bindings, so measured time includes the binding overhead. Pure JS parsers (Acorn, Babel) run directly in the JavaScript runtime.

\`lib.dom.d.ts\` is a global declaration script with no imports or exports. SWC parses it as a script rather than a module, because its npm binding otherwise rejects the file's \`...arguments\` parameter names under module strict mode.

**Why is Oxc slower than Babel here?** By default, \`oxc-parser\` serializes the AST to a JSON string on the Rust side and runs \`JSON.parse\` on the JavaScript side when you access \`result.program\`. Oxc's Rust-side parsing is extremely fast. It is this serialization boundary that dominates the end-to-end time. (If you call \`parseSync\` and never touch the result, Oxc looks much faster, because \`program\` is a lazy getter that defers the \`JSON.parse\`. The benchmarks above measure the time to actually obtain the full AST, which is what any real consumer of a parser does.)

**What about Oxc's \`experimentalRawTransfer\`?** Oxc also has a hidden experimental path that removes the JSON step entirely. It is not part of Oxc's documented parser options, but when the flag is passed, Rust parses directly into a huge \`ArrayBuffer\` shared with JavaScript, and generated JS code deserializes AST nodes straight out of that memory. It is genuinely clever engineering, and with it enabled Oxc's end-to-end numbers land much closer to Yuku's, since the two pipelines become architecturally the same (binary buffer in, ESTree objects out).

It is not part of the results above for a simple reason. This benchmark measures each parser's default, documented, stable API, the code path every user gets from \`npm install\`. Raw transfer today is an undocumented flag that is none of those things, and it cannot run here at all.

- **It does not work on Bun**, which this benchmark runs on. \`oxc-parser\`'s own \`rawTransferSupported()\` check returns \`false\` on Bun, and on Node < 22 and Deno < 2, because the design requires allocating an \`ArrayBuffer\` larger than 4 GiB. Enabling the option in this harness would simply throw.
- **It needs gigabytes of reserved memory per parse.** The trick that makes it fast is that the Rust arena is a fixed 2 GiB block aligned to a 4 GiB boundary, so 64-bit Rust pointers can be read from JavaScript as 32-bit buffer offsets. Achieving that alignment means reserving ~6 GiB of address space per buffer. Most of it stays virtual until touched, but every concurrent parse still needs its own dedicated 2 GiB arena, source and AST together must fit inside that block, and only 64-bit little-endian platforms are supported.

If Oxc stabilizes raw transfer as its default path, we will happily benchmark it. That is the fair comparison we want.

**Why is Yuku fast without any of that?** Yuku reaches the same zero-serialization end state, but by construction rather than by workaround. Its Zig parser does not build a pointer graph that later needs remapping. The AST *is already binary*, a flat table of fixed-size 44-byte node records addressed by index, with strings stored as offsets into the source. That layout is its own transfer format. It crosses the native boundary as one small buffer sized to the actual AST, and a generated decoder reads it in JavaScript through typed arrays, conceptually the same read side as Oxc's raw transfer minus the pointer-to-offset machinery that forces the giant fixed arena.

Because there are no pointers to remap, there is no 2 GiB block, no 4 GiB alignment requirement, no multi-gigabyte reservation, and no runtime gate. The same code path runs on Node, Bun, and Deno, parses files in parallel without multiplying memory, and uses only the memory the file actually needs. Zig's comptime generates both the binary layout and the JavaScript decoder from one source of truth, so they can never drift apart. The numbers in the tables above are Yuku's default and only mode. There is no faster experimental path being held back and nothing extra to enable.`;
}

async function main() {
  const readme = [
    "# ECMAScript Parser Benchmark (npm)",
    "",
    "Benchmarks for ECMAScript parsers available as npm packages, including pure JavaScript parsers and native parsers (Zig, Rust).",
    "",
    getSystemInfo(),
    "",
    generateParsersSection(),
    await generateBenchmarksSection(),
    generateRunSection(),
    "",
    generateMethodologySection(),
  ].join("\n");

  await writeFile(join(process.cwd(), "README.md"), readme);
  console.log("README.md generated successfully!");
}

main().catch(console.error);

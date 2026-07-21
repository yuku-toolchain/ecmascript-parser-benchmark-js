# ECMAScript Parser Benchmark (npm)

Benchmarks for ECMAScript parsers available as npm packages, including pure JavaScript parsers and native parsers (Zig, Rust) via NAPI bindings.

## System

| Property | Value |
|----------|-------|
| OS | macOS 24.6.0 (arm64) |
| CPU | Apple M3 |
| Cores | 8 |
| Memory | 16 GB |

## Parsers

### [Acorn](https://github.com/acornjs/acorn)

A tiny, fast JavaScript parser, written completely in JavaScript.

### [Babel](https://github.com/babel/babel/tree/main/packages/babel-parser)

A JavaScript compiler and parser used by the Babel toolchain.

### [Oxc](https://github.com/oxc-project/oxc)

A high-performance JavaScript and TypeScript parser written in Rust.

### [SWC](https://github.com/swc-project/swc)

An extensible Rust-based platform for compiling and bundling JavaScript and TypeScript.

### [Yuku](https://github.com/yuku-toolchain/yuku)

A high-performance & spec-compliant JavaScript/TypeScript compiler written in Zig.

## Benchmarks

### [typescript.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/typescript.js)

**File size:** 7.83 MB

![Bar chart comparing npm parser speeds for typescript.js](charts/typescript.png)

| Parser | Median | RME | Mean | Min | Max | Ops/sec | Relative |
|--------|--------|-----|------|-----|-----|---------|----------|
| **Yuku** | **45.67 ms** | **±0.51%** | **46.03 ms** | **43.28 ms** | **95.88 ms** | **21.89 ops/s** | **baseline** |
| Acorn | 141.32 ms | ±2.03% | 143.53 ms | 125.77 ms | 222.34 ms | 7.08 ops/s | 3.09× slower |
| Babel | 191.83 ms | ±3.51% | 200.92 ms | 147.05 ms | 427.27 ms | 5.21 ops/s | 4.20× slower |
| Oxc | 264.37 ms | ±1.19% | 269.51 ms | 257.97 ms | 340.27 ms | 3.78 ops/s | 5.79× slower |
| SWC | 568.49 ms | ±3.45% | 587.12 ms | 460.96 ms | 1201.09 ms | 1.76 ops/s | 12.45× slower |

### [checker.ts](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/checker.ts)

**File size:** 2.95 MB

![Bar chart comparing npm parser speeds for checker.ts](charts/checker.png)

| Parser | Median | RME | Mean | Min | Max | Ops/sec | Relative |
|--------|--------|-----|------|-----|-----|---------|----------|
| **Yuku** | **17.36 ms** | **±1.49%** | **17.94 ms** | **15.75 ms** | **102.50 ms** | **57.61 ops/s** | **baseline** |
| Babel | 78.70 ms | ±1.34% | 78.77 ms | 62.51 ms | 135.98 ms | 12.71 ops/s | 4.53× slower |
| Oxc | 81.41 ms | ±0.27% | 81.77 ms | 79.69 ms | 85.29 ms | 12.28 ops/s | 4.69× slower |
| SWC | 152.93 ms | ±0.34% | 157.68 ms | 148.67 ms | 251.15 ms | 6.54 ops/s | 8.81× slower |
| Acorn | Failed to parse | - | - | - | - | - | - |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![Bar chart comparing npm parser speeds for react.js](charts/react.png)

| Parser | Median | RME | Mean | Min | Max | Ops/sec | Relative |
|--------|--------|-----|------|-----|-----|---------|----------|
| **Yuku** | **0.30 ms** | **±0.33%** | **0.32 ms** | **0.28 ms** | **9.62 ms** | **3359.93 ops/s** | **baseline** |
| Acorn | 0.89 ms | ±0.67% | 0.92 ms | 0.83 ms | 28.19 ms | 1124.60 ops/s | 2.99× slower |
| Babel | 1.36 ms | ±0.70% | 1.45 ms | 0.98 ms | 22.37 ms | 737.34 ops/s | 4.56× slower |
| Oxc | 1.50 ms | ±0.18% | 1.53 ms | 1.46 ms | 4.99 ms | 668.43 ops/s | 5.03× slower |
| SWC | 2.77 ms | ±0.13% | 2.81 ms | 2.72 ms | 5.80 ms | 360.94 ops/s | 9.31× slower |

## Run Benchmarks

### Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager

### Steps

1. Clone the repository:

```bash
git clone https://github.com/yuku-toolchain/ecmascript-parser-benchmark-js.git
cd ecmascript-parser-benchmark-js
```

2. Install dependencies:

```bash
bun install
```

3. Run benchmarks:

```bash
bun bench
```

This will run benchmarks on all test files. Results are saved to the `result/` directory.

Benchmark duration is configurable via environment variables: `BENCH_TIME` (timed duration per run in ms, default 10000), `BENCH_WARMUP` (warmup duration in ms, default 2000), and `BENCH_RUNS` (independent runs per parser, default 3). For the most stable numbers, run on AC power with no other applications running.

## Methodology

Each parser is benchmarked using [Tinybench](https://github.com/tinylibs/tinybench) with warmup iterations followed by multiple timed runs. Each run measures the time to parse the source text into an AST. Source files are read from disk once and kept in memory for all iterations.

To keep results stable and fair, every parser × file combination runs in its own freshly spawned process, so JIT state and GC pressure from one parser never affect another. Each combination is benchmarked in multiple independent runs (3 by default), and the reported median is the median across those runs — a statistic that is robust to GC pauses, OS scheduling blips, and other outliers. The RME column shows the relative margin of error (99% confidence) within a run; differences between parsers smaller than their combined margins should be treated as noise.

Native parsers (Oxc, SWC, Yuku) run through their respective NAPI bindings, so measured time includes the binding overhead. Pure JS parsers (Acorn, Babel) run directly in the JavaScript runtime.

**Why is Oxc slower than Babel?** Oxc's npm package serializes the AST to a JSON string on the Rust side, then calls `JSON.parse` on the JavaScript side to make it available. This overhead makes it slower in end-to-end benchmarks, even though Oxc is very fast at raw parsing speed. If you only call the `parse` function without accessing the result, Oxc appears faster than Babel because the `program` field is a getter that defers `JSON.parse` until access. The benchmarks above measure the time to actually obtain the full AST for all parsers.

Oxc also has an `experimentalRawTransfer` option that makes `oxc-parser` roughly 2-3x faster than the results shown above. In practice it is unusable today. It only works in Node.js, so Bun and Deno are out, and it allocates gigabytes of memory upfront for a single parse. That blows up with out-of-memory errors on many systems and falls apart when parsing files in parallel.

**Why is Yuku fast?** Yuku's AST is designed from the ground up to be transfer-friendly: flat, compact, and near-binary. Instead of serializing to JSON and parsing it back, the AST produced by the Zig parser can be passed to JavaScript with minimal conversion. Zig's comptime makes this safe by design. There are no multi-gigabyte allocations, only the memory the source being parsed actually needs.
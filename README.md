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
| **Yuku** | **46.06 ms** | **±0.55%** | **46.39 ms** | **43.71 ms** | **70.85 ms** | **21.71 ops/s** | **baseline** |
| Acorn | 138.05 ms | ±1.23% | 138.32 ms | 124.36 ms | 156.35 ms | 7.24 ops/s | 3.00× slower |
| Babel | 188.32 ms | ±3.56% | 191.29 ms | 143.77 ms | 318.37 ms | 5.31 ops/s | 4.09× slower |
| Oxc | 263.65 ms | ±0.24% | 263.50 ms | 257.55 ms | 328.30 ms | 3.79 ops/s | 5.72× slower |
| SWC | 508.10 ms | ±2.84% | 529.76 ms | 466.83 ms | 907.39 ms | 1.97 ops/s | 11.03× slower |

### [checker.ts](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/checker.ts)

**File size:** 2.95 MB

![Bar chart comparing npm parser speeds for checker.ts](charts/checker.png)

| Parser | Median | RME | Mean | Min | Max | Ops/sec | Relative |
|--------|--------|-----|------|-----|-----|---------|----------|
| **Yuku** | **16.80 ms** | **±0.61%** | **17.20 ms** | **15.71 ms** | **27.98 ms** | **59.54 ops/s** | **baseline** |
| Babel | 80.02 ms | ±1.44% | 80.11 ms | 62.15 ms | 99.54 ms | 12.50 ops/s | 4.76× slower |
| Oxc | 81.69 ms | ±0.55% | 82.53 ms | 79.70 ms | 105.54 ms | 12.24 ops/s | 4.86× slower |
| SWC | 151.90 ms | ±0.38% | 152.58 ms | 149.27 ms | 199.76 ms | 6.58 ops/s | 9.04× slower |
| Acorn | Failed to parse | - | - | - | - | - | - |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![Bar chart comparing npm parser speeds for react.js](charts/react.png)

| Parser | Median | RME | Mean | Min | Max | Ops/sec | Relative |
|--------|--------|-----|------|-----|-----|---------|----------|
| **Yuku** | **0.30 ms** | **±0.30%** | **0.31 ms** | **0.28 ms** | **5.24 ms** | **3372.20 ops/s** | **baseline** |
| Acorn | 0.88 ms | ±0.22% | 0.90 ms | 0.83 ms | 4.30 ms | 1133.17 ops/s | 2.98× slower |
| Babel | 1.35 ms | ±0.69% | 1.43 ms | 0.98 ms | 8.39 ms | 739.74 ops/s | 4.56× slower |
| Oxc | 1.50 ms | ±0.23% | 1.53 ms | 1.47 ms | 7.23 ms | 665.89 ops/s | 5.06× slower |
| SWC | 2.78 ms | ±0.32% | 2.88 ms | 2.72 ms | 22.69 ms | 359.16 ops/s | 9.39× slower |

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
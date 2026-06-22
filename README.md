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

| Parser | Mean | Min | Max | Ops/sec | Relative |
|--------|------|-----|-----|---------|----------|
| **Yuku** | **57.99 ms** | **49.20 ms** | **123.00 ms** | **17.25 ops/s** | **baseline** |
| Acorn | 155.56 ms | 125.79 ms | 241.53 ms | 6.43 ops/s | 2.68× slower |
| Oxc | 288.59 ms | 261.30 ms | 584.19 ms | 3.47 ops/s | 4.98× slower |
| Babel | 334.47 ms | 165.95 ms | 690.26 ms | 2.99 ops/s | 5.77× slower |
| SWC | 510.38 ms | 439.12 ms | 690.79 ms | 1.96 ops/s | 8.80× slower |

### [calcom.tsx](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/calcom.tsx)

**File size:** 1.01 MB

![Bar chart comparing npm parser speeds for calcom.tsx](charts/calcom.png)

| Parser | Mean | Min | Max | Ops/sec | Relative |
|--------|------|-----|-----|---------|----------|
| **Yuku** | **10.13 ms** | **9.04 ms** | **78.61 ms** | **98.69 ops/s** | **baseline** |
| Babel | 47.94 ms | 32.88 ms | 148.17 ms | 20.86 ops/s | 4.73× slower |
| Oxc | 66.43 ms | 55.11 ms | 136.43 ms | 15.05 ops/s | 6.56× slower |
| SWC | 68.61 ms | 66.16 ms | 81.69 ms | 14.58 ops/s | 6.77× slower |
| Acorn | Failed to parse | - | - | - | - |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![Bar chart comparing npm parser speeds for react.js](charts/react.png)

| Parser | Mean | Min | Max | Ops/sec | Relative |
|--------|------|-----|-----|---------|----------|
| **Yuku** | **0.37 ms** | **0.34 ms** | **6.56 ms** | **2713.04 ops/s** | **baseline** |
| Acorn | 1.04 ms | 0.94 ms | 56.13 ms | 960.38 ops/s | 2.82× slower |
| Oxc | 1.55 ms | 1.48 ms | 4.07 ms | 643.81 ops/s | 4.21× slower |
| Babel | 1.65 ms | 1.32 ms | 50.21 ms | 606.49 ops/s | 4.47× slower |
| SWC | 2.67 ms | 2.58 ms | 9.20 ms | 375.23 ops/s | 7.23× slower |

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

## Methodology

Each parser is benchmarked using [Tinybench](https://github.com/tinylibs/tinybench) with warmup iterations followed by multiple timed runs. Each run measures the time to parse the source text into an AST. Source files are read from disk once and kept in memory for all iterations.

Native parsers (Oxc, SWC, Yuku) run through their respective NAPI bindings, so measured time includes the binding overhead. Pure JS parsers (Acorn, Babel) run directly in the JavaScript runtime.

**Why is Oxc slower than Babel?** Oxc's npm package serializes the AST to a JSON string on the Rust side, then calls `JSON.parse` on the JavaScript side to make it available. This overhead makes it slower in end-to-end benchmarks, even though Oxc is very fast at raw parsing speed. If you only call the `parse` function without accessing the result, Oxc appears faster than Babel because the `program` field is a getter that defers `JSON.parse` until access. The benchmarks above measure the time to actually obtain the full AST for all parsers.

Oxc also has an `experimentalRawTransfer` option that makes `oxc-parser` roughly 2-3x faster than the results shown above. However, it is currently experimental and comes with significant limitations: it only works in Node.js (not Bun, Deno, etc.), and it allocates gigabytes of memory upfront for a single parse, leading to out-of-memory errors on many systems and failures when parsing files in parallel.

**Why is Yuku fast?** Yuku's AST is designed from the ground up to be transfer-friendly: flat, compact, and near-binary. Instead of serializing to JSON and parsing it back, the AST produced by the Zig parser can be passed to JavaScript with minimal conversion. Zig's comptime makes this safe by design. There are no multi-gigabyte allocations, only the memory the source being parsed actually needs.
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
| **Yuku** | **59.31 ms** | **53.20 ms** | **103.54 ms** | **16.86 ops/s** | **baseline** |
| Acorn | 137.67 ms | 122.94 ms | 153.72 ms | 7.26 ops/s | 2.32× slower |
| Babel | 194.00 ms | 150.92 ms | 249.30 ms | 5.15 ops/s | 3.27× slower |
| Oxc | 277.77 ms | 260.65 ms | 402.82 ms | 3.60 ops/s | 4.68× slower |
| SWC | 472.58 ms | 434.94 ms | 560.46 ms | 2.12 ops/s | 7.97× slower |

### [calcom.tsx](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/calcom.tsx)

**File size:** 1.01 MB

![Bar chart comparing npm parser speeds for calcom.tsx](charts/calcom.png)

| Parser | Mean | Min | Max | Ops/sec | Relative |
|--------|------|-----|-----|---------|----------|
| **Yuku** | **11.13 ms** | **10.15 ms** | **45.57 ms** | **89.85 ops/s** | **baseline** |
| Babel | 42.16 ms | 32.65 ms | 61.06 ms | 23.72 ops/s | 3.79× slower |
| Oxc | 56.10 ms | 54.44 ms | 64.44 ms | 17.83 ops/s | 5.04× slower |
| SWC | 72.37 ms | 65.60 ms | 116.16 ms | 13.82 ops/s | 6.50× slower |
| Acorn | Failed to parse | - | - | - | - |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![Bar chart comparing npm parser speeds for react.js](charts/react.png)

| Parser | Mean | Min | Max | Ops/sec | Relative |
|--------|------|-----|-----|---------|----------|
| **Yuku** | **0.39 ms** | **0.36 ms** | **5.71 ms** | **2594.62 ops/s** | **baseline** |
| Acorn | 0.97 ms | 0.94 ms | 2.34 ms | 1028.52 ops/s | 2.52× slower |
| Babel | 1.50 ms | 1.28 ms | 4.23 ms | 667.75 ops/s | 3.89× slower |
| Oxc | 1.53 ms | 1.47 ms | 2.90 ms | 652.90 ops/s | 3.97× slower |
| SWC | 2.64 ms | 2.57 ms | 7.82 ms | 378.19 ops/s | 6.86× slower |

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
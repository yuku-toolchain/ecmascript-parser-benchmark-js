# ECMAScript Parser Benchmark (npm)

Benchmarks for ECMAScript parsers available as npm packages, including pure JavaScript parsers and native parsers (Zig, Rust) via NAPI bindings.

## System

| Property | Value |
|----------|-------|
| OS | macOS 24.6.0 (arm64) |
| CPU | Apple M4 Pro (Virtual) |
| Cores | 6 |
| Memory | 14 GB |

## Parsers

### [Acorn](https://github.com/acornjs/acorn)

A tiny, fast JavaScript parser, written completely in JavaScript.

### [Babel](https://github.com/babel/babel/tree/main/packages/babel-parser)

A JavaScript compiler and parser used by the Babel toolchain.

### [Hermes](https://github.com/nicolo-ribaudo/hermes-parser)

A JavaScript engine optimized for React Native, with a standalone parser available via WASM.

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

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 48.74 ms | 46.72 ms | 57.37 ms |
| Acorn | 115.62 ms | 103.66 ms | 145.07 ms |
| Babel | 156.36 ms | 127.92 ms | 198.87 ms |
| Hermes | 242.23 ms | 221.87 ms | 287.75 ms |
| Oxc | 242.98 ms | 226.74 ms | 279.49 ms |
| SWC | 410.32 ms | 393.61 ms | 478.46 ms |

### [three.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/three.js)

**File size:** 1.96 MB

![Bar chart comparing npm parser speeds for three.js](charts/three.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 14.61 ms | 13.82 ms | 23.12 ms |
| Acorn | 25.53 ms | 23.99 ms | 30.27 ms |
| Babel | 32.60 ms | 25.55 ms | 57.18 ms |
| Oxc | 43.68 ms | 42.47 ms | 48.60 ms |
| Hermes | 54.84 ms | 50.12 ms | 73.19 ms |
| SWC | 75.41 ms | 74.08 ms | 79.53 ms |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![Bar chart comparing npm parser speeds for react.js](charts/react.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 0.35 ms | 0.33 ms | 4.91 ms |
| Acorn | 0.81 ms | 0.76 ms | 2.05 ms |
| Babel | 0.95 ms | 0.82 ms | 3.80 ms |
| Oxc | 1.34 ms | 1.29 ms | 2.38 ms |
| Hermes | 1.62 ms | 1.52 ms | 5.75 ms |
| SWC | 2.54 ms | 2.44 ms | 3.96 ms |

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
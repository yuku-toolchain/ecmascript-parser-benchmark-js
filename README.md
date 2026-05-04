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

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 59.10 ms | 53.71 ms | 85.22 ms |
| Acorn | 139.62 ms | 123.58 ms | 219.67 ms |
| Babel | 179.43 ms | 143.97 ms | 256.63 ms |
| Oxc | 273.40 ms | 261.49 ms | 330.60 ms |
| SWC | 487.50 ms | 460.84 ms | 586.41 ms |

### [calcom.tsx](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/calcom.tsx)

**File size:** 1.01 MB

![Bar chart comparing npm parser speeds for calcom.tsx](charts/calcom.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 11.87 ms | 10.55 ms | 16.94 ms |
| Babel | 42.86 ms | 31.10 ms | 64.98 ms |
| Oxc | 56.83 ms | 54.44 ms | 62.94 ms |
| SWC | 70.58 ms | 67.67 ms | 79.75 ms |
| Acorn | Failed to parse | - | - |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![Bar chart comparing npm parser speeds for react.js](charts/react.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 0.44 ms | 0.38 ms | 5.42 ms |
| Acorn | 1.01 ms | 0.94 ms | 4.92 ms |
| Oxc | 1.54 ms | 1.48 ms | 8.12 ms |
| Babel | 1.58 ms | 1.16 ms | 10.02 ms |
| SWC | 2.87 ms | 2.75 ms | 22.55 ms |

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
# ECMAScript Parser Benchmark (JavaScript)

Benchmark ECMAScript parsers running in JavaScript, including pure JS parsers and native parsers via NAPI bindings.

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

![typescript.js Performance](charts/typescript.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 49.35 ms | 47.11 ms | 57.20 ms |
| Acorn | 117.88 ms | 105.32 ms | 143.56 ms |
| Babel | 161.47 ms | 127.53 ms | 216.28 ms |
| Oxc | 232.93 ms | 226.21 ms | 260.83 ms |
| Hermes | 239.92 ms | 215.97 ms | 300.34 ms |
| SWC | 418.37 ms | 396.54 ms | 527.10 ms |

### [three.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/three.js)

**File size:** 1.96 MB

![three.js Performance](charts/three.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 14.53 ms | 13.93 ms | 20.18 ms |
| Acorn | 25.82 ms | 24.57 ms | 30.12 ms |
| Babel | 31.13 ms | 25.53 ms | 43.42 ms |
| Oxc | 43.35 ms | 42.07 ms | 49.01 ms |
| Hermes | 55.11 ms | 51.28 ms | 65.14 ms |
| SWC | 75.85 ms | 73.84 ms | 80.33 ms |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![react.js Performance](charts/react.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 0.35 ms | 0.34 ms | 4.69 ms |
| Acorn | 0.83 ms | 0.78 ms | 7.48 ms |
| Babel | 0.94 ms | 0.83 ms | 3.46 ms |
| Oxc | 1.34 ms | 1.30 ms | 2.57 ms |
| Hermes | 1.69 ms | 1.57 ms | 5.73 ms |
| SWC | 2.49 ms | 2.41 ms | 4.03 ms |

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

**A note on Oxc:** Oxc has an `experimentalRawTransfer` option that makes `oxc-parser` roughly 2-3x faster than the results shown above. However, it is currently experimental and comes with significant limitations: it only works in Node.js (not Bun, Deno, etc.), and it allocates gigabytes of memory upfront for a single parse, leading to out-of-memory errors on many systems and failures when parsing files in parallel.
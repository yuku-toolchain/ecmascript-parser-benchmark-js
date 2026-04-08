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
| Yuku | 49.42 ms | 46.85 ms | 61.71 ms |
| Acorn | 112.81 ms | 103.48 ms | 129.08 ms |
| Babel | 154.58 ms | 125.18 ms | 189.79 ms |
| Oxc | 232.35 ms | 226.32 ms | 242.29 ms |
| Hermes | 238.61 ms | 215.66 ms | 270.83 ms |
| SWC | 414.53 ms | 399.10 ms | 506.23 ms |

### [three.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/three.js)

**File size:** 1.96 MB

![three.js Performance](charts/three.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 14.41 ms | 13.77 ms | 19.51 ms |
| Acorn | 25.56 ms | 24.28 ms | 30.30 ms |
| Babel | 30.31 ms | 24.46 ms | 44.19 ms |
| Oxc | 43.03 ms | 41.94 ms | 47.66 ms |
| Hermes | 54.38 ms | 50.73 ms | 65.01 ms |
| SWC | 75.84 ms | 74.35 ms | 80.75 ms |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![react.js Performance](charts/react.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 0.35 ms | 0.33 ms | 4.75 ms |
| Acorn | 0.84 ms | 0.79 ms | 3.79 ms |
| Babel | 0.90 ms | 0.80 ms | 6.25 ms |
| Oxc | 1.34 ms | 1.28 ms | 2.31 ms |
| Hermes | 1.65 ms | 1.54 ms | 6.12 ms |
| SWC | 2.49 ms | 2.40 ms | 3.64 ms |

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
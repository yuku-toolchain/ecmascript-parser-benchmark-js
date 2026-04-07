# ECMAScript Parser Benchmark (JavaScript)

Benchmark ECMAScript parsers running in JavaScript, including pure JS parsers and native parsers via NAPI bindings.

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
| Yuku | 59.35 ms | 51.86 ms | 101.42 ms |
| Acorn | 156.29 ms | 135.03 ms | 248.03 ms |
| Babel | 213.11 ms | 134.29 ms | 590.82 ms |
| Oxc | 324.41 ms | 268.03 ms | 444.03 ms |
| Hermes | 353.14 ms | 240.96 ms | 895.95 ms |
| SWC | 561.34 ms | 475.51 ms | 726.22 ms |

### [three.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/three.js)

**File size:** 1.96 MB

![three.js Performance](charts/three.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 18.39 ms | 16.55 ms | 77.06 ms |
| Acorn | 30.04 ms | 28.67 ms | 40.70 ms |
| Babel | 37.06 ms | 27.95 ms | 134.85 ms |
| Oxc | 51.97 ms | 48.99 ms | 67.58 ms |
| Hermes | 65.96 ms | 55.21 ms | 115.80 ms |
| SWC | 93.05 ms | 85.67 ms | 210.43 ms |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![react.js Performance](charts/react.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 0.41 ms | 0.38 ms | 5.10 ms |
| Acorn | 1.04 ms | 0.98 ms | 21.48 ms |
| Babel | 1.08 ms | 0.95 ms | 19.64 ms |
| Oxc | 1.64 ms | 1.53 ms | 16.95 ms |
| Hermes | 1.86 ms | 1.69 ms | 35.46 ms |
| SWC | 2.95 ms | 2.80 ms | 14.03 ms |

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
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
| Yuku | 50.00 ms | 46.60 ms | 64.62 ms |
| Acorn | 114.71 ms | 104.52 ms | 130.44 ms |
| Babel | 155.38 ms | 125.06 ms | 197.03 ms |
| Oxc | 233.01 ms | 225.61 ms | 256.33 ms |
| Hermes | 242.55 ms | 218.87 ms | 298.53 ms |
| SWC | 417.36 ms | 394.00 ms | 482.37 ms |

### [three.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/three.js)

**File size:** 1.96 MB

![three.js Performance](charts/three.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 14.41 ms | 13.84 ms | 20.74 ms |
| Acorn | 26.07 ms | 24.27 ms | 31.50 ms |
| Babel | 29.94 ms | 24.96 ms | 38.01 ms |
| Oxc | 43.59 ms | 42.13 ms | 49.88 ms |
| Hermes | 53.64 ms | 49.94 ms | 73.71 ms |
| SWC | 75.69 ms | 74.31 ms | 79.52 ms |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![react.js Performance](charts/react.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 0.35 ms | 0.33 ms | 4.53 ms |
| Acorn | 0.83 ms | 0.79 ms | 2.26 ms |
| Babel | 0.94 ms | 0.84 ms | 4.60 ms |
| Oxc | 1.37 ms | 1.31 ms | 3.77 ms |
| Hermes | 1.65 ms | 1.51 ms | 5.65 ms |
| SWC | 2.48 ms | 2.40 ms | 3.73 ms |

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
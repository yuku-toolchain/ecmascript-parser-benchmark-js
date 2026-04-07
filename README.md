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

**Type:** Pure JS

A tiny, fast JavaScript parser, written completely in JavaScript.

### [Babel](https://github.com/babel/babel/tree/main/packages/babel-parser)

**Type:** Pure JS

A JavaScript compiler and parser used by the Babel toolchain.

### [Oxc](https://github.com/oxc-project/oxc)

**Type:** Native (NAPI)

A high-performance JavaScript and TypeScript parser written in Rust, with NAPI bindings.

### [SWC](https://github.com/swc-project/swc)

**Type:** Native (NAPI)

An extensible Rust-based platform for compiling and bundling JavaScript and TypeScript, with NAPI bindings.

### [Yuku](https://github.com/yuku-toolchain/yuku)

**Type:** Native (NAPI)

A high-performance & spec-compliant JavaScript/TypeScript compiler written in Zig, with NAPI bindings.

## Benchmarks

### [typescript.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/typescript.js)

**File size:** 7.83 MB

![typescript.js Performance](charts/typescript.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 63.77 ms | 52.97 ms | 93.18 ms |
| Acorn | 159.94 ms | 136.92 ms | 291.29 ms |
| Babel | 203.60 ms | 159.32 ms | 357.88 ms |
| Oxc | 287.68 ms | 271.93 ms | 349.65 ms |
| SWC | 585.15 ms | 489.98 ms | 963.14 ms |

### [three.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/three.js)

**File size:** 1.96 MB

![three.js Performance](charts/three.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 18.68 ms | 16.55 ms | 79.45 ms |
| Acorn | 32.11 ms | 29.67 ms | 36.81 ms |
| Babel | 39.39 ms | 28.78 ms | 49.95 ms |
| Oxc | 52.85 ms | 49.54 ms | 101.73 ms |
| SWC | 92.47 ms | 87.38 ms | 108.34 ms |

### [react.js](https://raw.githubusercontent.com/yuku-toolchain/parser-benchmark-files/refs/heads/main/react.js)

**File size:** 0.07 MB

![react.js Performance](charts/react.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 0.42 ms | 0.38 ms | 4.23 ms |
| Acorn | 1.08 ms | 0.96 ms | 7.11 ms |
| Babel | 1.41 ms | 0.93 ms | 6.41 ms |
| Oxc | 1.60 ms | 1.54 ms | 5.40 ms |
| SWC | 2.92 ms | 2.81 ms | 6.52 ms |

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
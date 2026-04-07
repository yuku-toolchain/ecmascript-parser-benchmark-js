declare module "hermes-parser" {
  export function parse(source: string, options?: { sourceType?: "module" | "script" }): { body: unknown[] };
}

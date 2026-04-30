import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_DIR = join(__dirname, "..", "_site");

export function readOutput(relativePath) {
  const full = join(SITE_DIR, relativePath);
  if (!existsSync(full)) throw new Error(`Output file missing: ${relativePath}`);
  return readFileSync(full, "utf-8");
}

export function outputExists(relativePath) {
  return existsSync(join(SITE_DIR, relativePath));
}

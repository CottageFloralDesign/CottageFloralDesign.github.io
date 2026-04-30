import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "..");
const SITE_DIR = join(TEMPLATE_DIR, "_site");

let built = false;

export function buildOnce() {
  if (built) return;
  execSync("npx eleventy", { cwd: TEMPLATE_DIR, stdio: "pipe" });
  built = true;
}

export function readOutput(relativePath) {
  buildOnce();
  const full = join(SITE_DIR, relativePath);
  if (!existsSync(full)) throw new Error(`Output file missing: ${relativePath}`);
  return readFileSync(full, "utf-8");
}

export function outputExists(relativePath) {
  buildOnce();
  return existsSync(join(SITE_DIR, relativePath));
}

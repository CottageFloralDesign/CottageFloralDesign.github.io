import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

test("netlify.toml exists with build command", () => {
  const txt = readFileSync(join(REPO_ROOT, "netlify.toml"), "utf-8");
  assert.match(txt, /command\s*=\s*"npm run build"/);
  assert.match(txt, /publish\s*=\s*"_site"/);
  assert.match(txt, /NODE_VERSION\s*=\s*"20"/);
});

test("HANDOFF.md exists and covers key topics", () => {
  const md = readFileSync(join(REPO_ROOT, "HANDOFF.md"), "utf-8");
  assert.match(md, /Logging in/i);
  assert.match(md, /Adding a wedding/i);
  assert.match(md, /Editing pages/i);
  assert.match(md, /Publishing/i);
});

test("netlify.toml has legacy portfolio URL redirects", () => {
  const txt = readFileSync(join(REPO_ROOT, "netlify.toml"), "utf-8");
  assert.match(txt, /from\s*=\s*"\/portfolio\/austin-anna\.html"/);
  assert.match(txt, /status\s*=\s*301/);
});

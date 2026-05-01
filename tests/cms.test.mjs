import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import yaml from "js-yaml";
import { outputExists } from "./render.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

test("admin/index.html is in build output", () => {
  assert.ok(outputExists("admin/index.html"));
});

test("admin/config.yml is in build output", () => {
  assert.ok(outputExists("admin/config.yml"));
});

test("admin config has git-gateway backend", () => {
  const raw = readFileSync(join(REPO_ROOT, "admin/config.yml"), "utf-8");
  const cfg = yaml.load(raw);
  assert.equal(cfg.backend.name, "git-gateway");
});

test("admin config has editorial_workflow publish mode", () => {
  const raw = readFileSync(join(REPO_ROOT, "admin/config.yml"), "utf-8");
  const cfg = yaml.load(raw);
  assert.equal(cfg.publish_mode, "editorial_workflow");
});

test("admin config has portfolio collection with required alt fields", () => {
  const raw = readFileSync(join(REPO_ROOT, "admin/config.yml"), "utf-8");
  const cfg = yaml.load(raw);
  const portfolio = cfg.collections.find(c => c.name === "portfolio");
  assert.ok(portfolio, "portfolio collection must exist");
  const heroAlt = portfolio.fields.find(f => f.name === "hero_image_alt");
  assert.equal(heroAlt.required, true, "hero_image_alt must be required");
});

test("admin config has Pages collection with home, about, portfolio_page, inquiry", () => {
  const raw = readFileSync(join(REPO_ROOT, "admin/config.yml"), "utf-8");
  const cfg = yaml.load(raw);
  const pages = cfg.collections.find(c => c.name === "pages");
  assert.ok(pages);
  const fileNames = pages.files.map(f => f.name);
  assert.ok(fileNames.includes("home"));
  assert.ok(fileNames.includes("about"));
  assert.ok(fileNames.includes("portfolio_page"));
  assert.ok(fileNames.includes("inquiry"));
});

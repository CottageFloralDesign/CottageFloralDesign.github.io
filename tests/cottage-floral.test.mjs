import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readOutput, outputExists } from "./render.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

test("home page identifies Cottage Floral Design as the business", () => {
  const html = readOutput("index.html");
  assert.match(html, /Cottage Floral Design/);
});

test("LocalBusiness schema names Cottage Floral Design", () => {
  const html = readOutput("index.html");
  assert.match(html, /"name":\s*"Cottage Floral Design"/);
});

test("home page references the actual location in metadata", () => {
  const html = readOutput("index.html");
  assert.match(html, /Salt Lake City|Park City|Utah/);
});

test("all four portfolio entries build", () => {
  for (const slug of ["austin-anna", "dani-rock", "katelyn-brad", "maile-aidan"]) {
    assert.ok(outputExists(`portfolio/${slug}/index.html`), `missing ${slug}`);
  }
});

test("portfolio listing links to all four weddings", () => {
  const html = readOutput("portfolio/index.html");
  for (const slug of ["austin-anna", "dani-rock", "katelyn-brad", "maile-aidan"]) {
    assert.match(html, new RegExp(`href="/portfolio/${slug}/"`));
  }
});

test("seasonal pages are present in build output", () => {
  assert.ok(outputExists("mothers-day.html"));
  assert.ok(outputExists("dance-flowers.html"));
});

test("seasonal page nav links use new URL structure", () => {
  const html = readOutput("mothers-day.html");
  assert.match(html, /href="\/portfolio\/"/);
  assert.match(html, /href="\/about\/"/);
  assert.match(html, /href="\/inquiry\/"/);
});

test("hero images referenced by data files exist on disk", () => {
  const html = readOutput("index.html");
  const match = html.match(/url\('(\/assets\/[^']+)'\)/);
  assert.ok(match, "hero background-image URL not found in rendered HTML");
  const path = join(REPO_ROOT, "_site", match[1]);
  assert.ok(existsSync(path), `hero image missing from build output: ${match[1]}`);
});

test("CNAME file is at repo root for custom domain", () => {
  const cname = readFileSync(join(REPO_ROOT, "CNAME"), "utf-8").trim();
  assert.equal(cname, "cottagefloraldesign.com");
});

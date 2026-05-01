import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("austin-anna wedding builds to its own directory", () => {
  assert.ok(outputExists("portfolio/austin-anna/index.html"));
});

test("dani-rock wedding builds to its own directory", () => {
  assert.ok(outputExists("portfolio/dani-rock/index.html"));
});

test("portfolio entry renders title, location, venue, and gallery", () => {
  const html = readOutput("portfolio/austin-anna/index.html");
  assert.match(html, /Anna.*Austin|Austin.*Anna/);
  assert.match(html, /class="gallery"/);
  assert.match(html, /<img[^>]*alt="[^"]+"/);
});

test("portfolio entry renders SEO from frontmatter", () => {
  const html = readOutput("portfolio/austin-anna/index.html");
  assert.match(html, /<title>[^<]*Anna[^<]*<\/title>/);
});

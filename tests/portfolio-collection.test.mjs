import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("sample wedding 1 builds to its own directory", () => {
  assert.ok(outputExists("portfolio/sample-wedding-1/index.html"));
});

test("sample wedding 2 builds to its own directory", () => {
  assert.ok(outputExists("portfolio/sample-wedding-2/index.html"));
});

test("portfolio entry renders title, location, venue, and gallery", () => {
  const html = readOutput("portfolio/sample-wedding-1/index.html");
  assert.match(html, /Sample Wedding 1/);
  assert.match(html, /class="gallery"/);
  assert.match(html, /<img[^>]*alt="[^"]+"/);
});

test("portfolio entry renders SEO from frontmatter", () => {
  const html = readOutput("portfolio/sample-wedding-1/index.html");
  assert.match(html, /<title>Sample Wedding 1[^<]*<\/title>/);
});

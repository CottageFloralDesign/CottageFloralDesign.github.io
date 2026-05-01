import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput } from "./render.mjs";

test("base layout renders <html lang>, <title>, meta description", () => {
  const html = readOutput("index.html");
  assert.match(html, /<html[^>]*lang="en"/);
  assert.match(html, /<title>[^<]*Cottage Floral[^<]*<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+"/);
});

test("base layout renders OpenGraph and canonical tags", () => {
  const html = readOutput("index.html");
  assert.match(html, /<link rel="canonical" href="[^"]*\/"/);
  assert.match(html, /<meta property="og:title" content="[^"]*Cottage Floral[^"]*"/);
  assert.match(html, /<meta property="og:type" content="website"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
});

test("base layout renders inline CSS theme variables from site.theme", () => {
  const html = readOutput("index.html");
  assert.match(html, /<style>[\s\S]*--primary:/);
});

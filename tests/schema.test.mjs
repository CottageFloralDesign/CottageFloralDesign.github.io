import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput } from "./render.mjs";

test("home page includes LocalBusiness JSON-LD", () => {
  const html = readOutput("index.html");
  assert.match(html, /<script type="application\/ld\+json">[\s\S]*"@type":\s*"Florist"/);
});

test("LocalBusiness schema contains business_name", () => {
  const html = readOutput("index.html");
  assert.match(html, /"name":\s*"Cottage Floral Design"/);
});

test("portfolio entry includes Article schema", () => {
  const html = readOutput("portfolio/sample-wedding-1/index.html");
  assert.match(html, /<script type="application\/ld\+json">[\s\S]*"@type":\s*"Article"/);
});

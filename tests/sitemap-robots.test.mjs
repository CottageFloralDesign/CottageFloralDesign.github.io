import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("sitemap.xml is generated", () => {
  assert.ok(outputExists("sitemap.xml"));
});

test("sitemap includes home and portfolio pages", () => {
  const xml = readOutput("sitemap.xml");
  assert.match(xml, /<loc>[^<]*\/<\/loc>/);
  assert.match(xml, /<loc>[^<]*\/portfolio\/<\/loc>/);
  assert.match(xml, /<loc>[^<]*\/portfolio\/sample-wedding-1\/<\/loc>/);
});

test("robots.txt is generated", () => {
  assert.ok(outputExists("robots.txt"));
  const txt = readOutput("robots.txt");
  assert.match(txt, /User-agent: \*/);
  assert.match(txt, /Sitemap: /);
});

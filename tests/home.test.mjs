import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("home page builds to /index.html", () => {
  assert.ok(outputExists("index.html"));
});

test("home page renders hero from data file", () => {
  const html = readOutput("index.html");
  assert.match(html, /class="hero"/);
  assert.match(html, /Cottage Floral/);
});

test("home page renders nav and footer", () => {
  const html = readOutput("index.html");
  assert.match(html, /class="header"/);
  assert.match(html, /class="footer"/);
});

test("home page seo title comes from home.yml seo block", () => {
  const html = readOutput("index.html");
  assert.match(html, /<title>[^<]*Cottage Floral[^<]*<\/title>/);
});

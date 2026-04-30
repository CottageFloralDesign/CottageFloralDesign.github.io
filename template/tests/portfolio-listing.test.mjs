import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("portfolio listing builds to /portfolio/index.html", () => {
  assert.ok(outputExists("portfolio/index.html"));
});

test("portfolio listing links to all portfolio entries", () => {
  const html = readOutput("portfolio/index.html");
  assert.match(html, /href="\/portfolio\/sample-wedding-1\//);
  assert.match(html, /href="\/portfolio\/sample-wedding-2\//);
});

test("portfolio listing entries show hero image and title", () => {
  const html = readOutput("portfolio/index.html");
  assert.match(html, /Sample Wedding 1/);
  assert.match(html, /<img[^>]*src="\/assets\/portfolio\/sample-wedding-1\/hero\.jpg"/);
});

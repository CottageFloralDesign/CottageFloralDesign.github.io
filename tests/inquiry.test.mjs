import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("inquiry page builds to /inquiry/index.html", () => {
  assert.ok(outputExists("inquiry/index.html"));
});

test("inquiry page renders the form embed", () => {
  const html = readOutput("inquiry/index.html");
  // The Petala embed should render — check for the div target and script src
  assert.match(html, /petala-embed-cottage-floral-design|app\.petalafloral\.com/i);
});

test("inquiry page renders nav and footer", () => {
  const html = readOutput("inquiry/index.html");
  assert.match(html, /class="header"/);
  assert.match(html, /class="footer"/);
});

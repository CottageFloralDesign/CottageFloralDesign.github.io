import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("about page builds to /about/index.html", () => {
  assert.ok(outputExists("about/index.html"));
});

test("about page renders designer section and philosophy", () => {
  const html = readOutput("about/index.html");
  assert.match(html, /class="about-intro"/);
  assert.match(html, /Our Philosophy/);
});

test("about page includes nav and footer", () => {
  const html = readOutput("about/index.html");
  assert.match(html, /class="header"/);
  assert.match(html, /class="footer"/);
});

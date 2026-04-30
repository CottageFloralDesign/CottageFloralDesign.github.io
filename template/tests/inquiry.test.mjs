import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("inquiry page builds to /inquiry/index.html", () => {
  assert.ok(outputExists("inquiry/index.html"));
});

test("inquiry page renders form embed slot", () => {
  const html = readOutput("inquiry/index.html");
  assert.match(html, /\{\{INQUIRY_FORM_EMBED\}\}/);
});

test("inquiry page renders nav and footer", () => {
  const html = readOutput("inquiry/index.html");
  assert.match(html, /class="header"/);
  assert.match(html, /class="footer"/);
});

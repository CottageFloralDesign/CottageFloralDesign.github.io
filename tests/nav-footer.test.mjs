import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput } from "./render.mjs";

test("nav renders all links from site.nav", () => {
  const html = readOutput("index.html");
  assert.match(html, /<a[^>]*href="\/"[^>]*>Home<\/a>/);
  assert.match(html, /<a[^>]*href="\/portfolio\/"[^>]*>Portfolio<\/a>/);
  assert.match(html, /<a[^>]*href="\/about\/"[^>]*>About<\/a>/);
  assert.match(html, /<a[^>]*href="\/inquiry\/"[^>]*>Inquire<\/a>/);
});

test("nav marks current page as active", () => {
  const html = readOutput("index.html");
  assert.match(html, /class="nav__link/);
});

test("footer shows business name, location, and service areas", () => {
  const html = readOutput("index.html");
  assert.match(html, /\{\{BUSINESS_NAME\}\}/);
});

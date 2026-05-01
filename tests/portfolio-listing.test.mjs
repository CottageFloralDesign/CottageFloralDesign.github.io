import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput, outputExists } from "./render.mjs";

test("portfolio listing builds to /portfolio/index.html", () => {
  assert.ok(outputExists("portfolio/index.html"));
});

test("portfolio listing links to all four weddings", () => {
  const html = readOutput("portfolio/index.html");
  for (const slug of ["austin-anna", "dani-rock", "katelyn-brad", "maile-aidan"]) {
    assert.match(html, new RegExp(`href="/portfolio/${slug}/"`));
  }
});

test("portfolio listing entries show hero image and title", () => {
  const html = readOutput("portfolio/index.html");
  assert.match(html, /Anna.*Austin|Austin.*Anna/);
  assert.match(html, /<img[^>]*src="\/assets\/portfolio\/austin-anna\/[^"]+"/);
});

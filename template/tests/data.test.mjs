import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import yaml from "../node_modules/js-yaml/dist/js-yaml.js";

test("site.yml has required top-level keys", () => {
  const raw = readFileSync(new URL("../_data/site.yml", import.meta.url), "utf-8");
  const site = yaml.load(raw);
  assert.ok(site.business_name, "business_name required");
  assert.ok(site.tagline, "tagline required");
  assert.ok(site.url, "url required");
  assert.ok(site.location?.city, "location.city required");
  assert.ok(site.location?.region, "location.region required");
  assert.ok(Array.isArray(site.location?.service_areas), "service_areas must be a list");
  assert.ok(site.contact?.email, "contact.email required");
  assert.ok(Array.isArray(site.nav), "nav must be a list");
});

test("seo_defaults.yml has required defaults", () => {
  const raw = readFileSync(new URL("../_data/seo_defaults.yml", import.meta.url), "utf-8");
  const seo = yaml.load(raw);
  assert.ok(seo.default_og_image, "default_og_image required");
  assert.ok(seo.default_keywords, "default_keywords required");
});

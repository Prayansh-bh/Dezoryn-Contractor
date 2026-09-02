import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_PRODUCTS, DEFAULT_SITE_SETTINGS } from "../shared/constants";

test("shared constants integrity", () => {
  assert.equal(Array.isArray(DEFAULT_PRODUCTS), true);
  assert.equal(DEFAULT_PRODUCTS.length >= 6, true);
  assert.equal(typeof DEFAULT_SITE_SETTINGS.company_name, "string");
  assert.equal(DEFAULT_SITE_SETTINGS.company_name, "Dezoryn Contractor");
});

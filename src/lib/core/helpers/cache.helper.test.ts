import { beforeEach, describe, expect, it } from "vitest";

import { CacheHelper } from "./cache.helper.ts";



describe("tests CacheHelper", () => {
  let cache: CacheHelper<string>;

  beforeEach(() => {
    cache = new CacheHelper<string>();
  });

  describe("edge cases", () => {
    it("stores falsy values", () => {
      const numbers = new CacheHelper<number>();

      expect(numbers.set("zero", 0)).toBe(true);
      expect(numbers.has("zero")).toBe(true);
      expect(numbers.set("zero", 1)).toBe(false);
      expect(numbers.get("zero")).toBe(0);
    });

    it("does not treat prototype keys as cached", () => {
      expect(cache.has("toString")).toBe(false);
      expect(cache.has("__proto__")).toBe(false);
      expect(cache.set("__proto__", "value")).toBe(true);
      expect(cache.get("__proto__")).toBe("value");
    });

    it("lists and clears values", () => {
      cache.set("a", "1");
      cache.set("b", "2");

      expect(cache.values()).toEqual(["1", "2"]);

      cache.clear();

      expect(cache.values()).toEqual([]);
    });
  });

  describe("set", () => {
    it("returns true when setting a new key", () => {
      expect(cache.set("key", "value")).toBe(true);
    });

    it("returns false when the key already exists", () => {
      cache.set("key", "value");
      expect(cache.set("key", "other")).toBe(false);
    });

    it("does not overwrite an existing value", () => {
      cache.set("key", "original");
      cache.set("key", "overwrite");
      expect(cache.get("key")).toBe("original");
    });
  });

  describe("get", () => {
    it("returns the stored value", () => {
      cache.set("key", "value");
      expect(cache.get("key")).toBe("value");
    });

    it("returns undefined for a missing key", () => {
      expect(cache.get("missing")).toBeUndefined();
    });
  });

  describe("has", () => {
    it("returns true when the key exists", () => {
      cache.set("key", "value");
      expect(cache.has("key")).toBe(true);
    });

    it("returns false when the key does not exist", () => {
      expect(cache.has("missing")).toBe(false);
    });
  });

  describe("delete", () => {
    it("returns true when the key exists and removes it", () => {
      cache.set("key", "value");
      expect(cache.delete("key")).toBe(true);
      expect(cache.has("key")).toBe(false);
    });

    it("returns false when the key does not exist", () => {
      expect(cache.delete("missing")).toBe(false);
    });

    it("makes the value unretrievable after deletion", () => {
      cache.set("key", "value");
      cache.delete("key");
      expect(cache.get("key")).toBeUndefined();
    });
  });
});

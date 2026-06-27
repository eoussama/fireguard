import { beforeEach, describe, expect, it } from "vitest";

import { CacheHelper } from "./cache.helper";



describe("tests CacheHelper", () => {
  let cache: CacheHelper<string>;

  beforeEach(() => {
    cache = new CacheHelper<string>();
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

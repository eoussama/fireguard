import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FireguardHelper } from "./fireguard.helper";



describe("tests FireguardHelper", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getHost", () => {
    it("returns opener when window.opener is set", () => {
      const opener = {};

      vi.stubGlobal("window", { opener, parent: globalThis.window });
      expect(FireguardHelper.getHost()).toBe(opener);
    });

    it("returns parent when inside an iframe (parent !== window)", () => {
      const parent = {};

      vi.stubGlobal("window", { opener: null, parent });
      expect(FireguardHelper.getHost()).toBe(parent);
    });

    it("returns null when window.parent equals window (top-level, no opener)", () => {
      const win = { opener: null } as unknown as Window & typeof globalThis;

      (win as unknown as { parent: unknown }).parent = win;
      vi.stubGlobal("window", win);
      expect(FireguardHelper.getHost()).toBeNull();
    });

    it("returns null when neither opener nor parent is available", () => {
      vi.stubGlobal("window", { opener: null, parent: null });
      expect(FireguardHelper.getHost()).toBeNull();
    });
  });

  describe("isReady", () => {
    beforeEach(() => {
      vi.stubGlobal("window", { opener: null });
    });

    it("returns false when window.opener is null and no parent", () => {
      expect(FireguardHelper.isReady()).toBe(false);
    });

    it("returns true when window.opener is set", () => {
      vi.stubGlobal("window", { opener: {} });
      expect(FireguardHelper.isReady()).toBe(true);
    });

    it("returns true when inside an iframe (window.parent !== window)", () => {
      const parent = {};

      vi.stubGlobal("window", { opener: null, parent });
      expect(FireguardHelper.isReady()).toBe(true);
    });

    it("returns false when window.parent equals window (top-level direct navigation)", () => {
      const win = { opener: null } as unknown as Window & typeof globalThis;

      (win as unknown as { parent: unknown }).parent = win;
      vi.stubGlobal("window", win);
      expect(FireguardHelper.isReady()).toBe(false);
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FireguardHelper } from "./fireguard.helper";



describe("tests FireguardHelper", () => {
  describe("isReady", () => {
    beforeEach(() => {
      vi.stubGlobal("window", { opener: null });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("returns false when window.opener is null", () => {
      expect(FireguardHelper.isReady()).toBe(false);
    });

    it("returns true when window.opener is set", () => {
      vi.stubGlobal("window", { opener: {} });
      expect(FireguardHelper.isReady()).toBe(true);
    });
  });
});

import type { TFireguardConfig } from "@eoussama/firemitt";
import { InvalidAppNameError, InvalidFirebaseConfigError } from "@eoussama/firemitt";
import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { appStore } from "../stores/app.store.ts";
import { ConfigHelper, DEFAULT_THEME } from "./config.helper.ts";



const FIREBASE = { apiKey: "key", appId: "app", projectId: "project", authDomain: "project.firebaseapp.com" };

describe("tests ConfigHelper", () => {
  describe("resolveColor", () => {
    it("keeps valid colors", () => {
      expect(ConfigHelper.resolveColor("primary", "#ee16cc").hex()).toBe("#ee16cc");
      expect(ConfigHelper.resolveColor("primary", "red").hex()).toBe("#ff0000");
    });

    it.each([undefined, "", "var(--x)", "not-a-color", 42])("falls back to the default for %j", (value) => {
      expect(ConfigHelper.resolveColor("background", value).hex()).toBe(DEFAULT_THEME.background);
    });
  });

  describe("load", () => {
    let setProperty: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      setProperty = vi.fn();
      vi.stubGlobal("document", { documentElement: { style: { setProperty } } });
      appStore.init();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("applies the theme with fallbacks and stores the configuration, even without a theme", () => {
      const config = { name: "App", firebase: FIREBASE } as unknown as TFireguardConfig;

      ConfigHelper.load(config);

      expect(setProperty).toHaveBeenCalledWith("--color-primary", DEFAULT_THEME.primary);
      expect(get(appStore).config).toBe(config);
    });

    it("never produces NaN hues for achromatic colors", () => {
      ConfigHelper.load({ name: "App", firebase: FIREBASE, theme: { text: "#000000", primary: "#ffffff", secondary: "#808080", background: "#ffffff" } } as TFireguardConfig);

      const hsl = setProperty.mock.calls.filter(([name]) => String(name).endsWith("-hsl")).map(([, value]) => value);

      expect(hsl).toHaveLength(4);
      hsl.forEach(value => expect(value).not.toContain("NaN"));
    });
  });

  describe("validate", () => {
    it("accepts configurations sent by older Firemitt versions", () => {
      expect(() => ConfigHelper.validate({ name: "App", firebase: FIREBASE } as TFireguardConfig)).not.toThrow();
    });

    it("requires an application name", () => {
      expect(() => ConfigHelper.validate({ name: " ", firebase: FIREBASE } as TFireguardConfig)).toThrow(InvalidAppNameError);
    });

    it("does not require the Firebase app ID, which Firemitt 0.1.5 and earlier may not send", () => {
      expect(() => ConfigHelper.validate({ name: "App", firebase: { ...FIREBASE, appId: "" } } as TFireguardConfig)).not.toThrow();
    });

    it.each(["apiKey", "authDomain"])("requires the Firebase %s", (key) => {
      expect(() => ConfigHelper.validate({ name: "App", firebase: { ...FIREBASE, [key]: "" } } as TFireguardConfig)).toThrow(InvalidFirebaseConfigError);
    });

    it("requires a Firebase configuration", () => {
      expect(() => ConfigHelper.validate({ name: "App" } as TFireguardConfig)).toThrow(InvalidFirebaseConfigError);
    });
  });
});

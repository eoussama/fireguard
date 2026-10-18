import type { TColor, TFireguardConfig, TTheme } from "@eoussama/firemitt";
import { InvalidAppNameError, InvalidFirebaseConfigError } from "@eoussama/firemitt";
import chroma from "chroma-js";

import { appStore } from "../stores/app.store.ts";



/**
 * @description
 * Default theme colors, used for missing or invalid values.
 */
export const DEFAULT_THEME: TTheme = {
  text: "#1a3544",
  primary: "#ffe536",
  secondary: "#1a3544",
  background: "#ffffff",
};

/**
 * @description
 * Helper class for loading configuration settings.
 */
export class ConfigHelper {
  /**
   * @description
   * Resolves a theme color, falling back to its default when it is missing or not a valid color.
   *
   * @param name - The color name.
   * @param color - The configured color value.
   * @returns The resolved color.
   */
  static resolveColor(name: TColor, color: unknown): chroma.Color {
    return typeof color === "string" && chroma.valid(color) ? chroma(color) : chroma(DEFAULT_THEME[name]);
  }

  /**
   * @description
   * Loads color settings and applies them to the application.
   *
   * @param name - The color variable name.
   * @param color - The color value.
   */
  private static loadColor(name: TColor, color: unknown): void {
    const root = document.documentElement;
    const chromaColor = this.resolveColor(name, color);

    const [hue, saturation] = chromaColor.hsl();

    root.style.setProperty(`--color-${name}`, chromaColor.hex());
    root.style.setProperty(`--color-${name}-rgb`, chromaColor.rgb().join(","));
    root.style.setProperty(`--color-${name}-hsl`, `${Number.isNaN(hue) ? 0 : hue}, ${saturation * 100}%`);
  }

  /**
   * @description
   * Validates the parts of the configuration Fireguard needs to authenticate.
   * The check is intentionally lenient, so that configurations sent by older Firemitt versions keep working.
   *
   * @param config The configuration to validate.
   * @throws {InvalidAppNameError} If the application name is missing.
   * @throws {InvalidFirebaseConfigError} If the Firebase API key or auth domain is missing.
   */
  static validate(config: TFireguardConfig): void {
    const isFilled = (value: unknown) => typeof value === "string" && value.trim().length > 0;

    if (!isFilled(config.name)) {
      throw new InvalidAppNameError();
    }

    const firebase: Partial<TFireguardConfig["firebase"]> = config.firebase ?? {};

    if (!isFilled(firebase.apiKey) || !isFilled(firebase.authDomain)) {
      throw new InvalidFirebaseConfigError();
    }
  }

  /**
   * @description
   * Loads the entire configuration settings: applies the theme (with fallbacks) and stores the configuration.
   *
   * @param config The configuration settings to load.
   */
  static load(config: TFireguardConfig): void {
    const colors: Array<TColor> = ["primary", "secondary", "text", "background"];

    colors.forEach(color => this.loadColor(color, config.theme?.[color]));
    appStore.loadConfig(config);
  }
}

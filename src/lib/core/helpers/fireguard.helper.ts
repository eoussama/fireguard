import type { Page } from "../enums/page.enum";
import { goto } from "$app/navigation";

import { base } from "$app/paths";



/**
 * @description
 * Helper class for Fireguard related functionalities.
 */
export class FireguardHelper {
  /**
   * @description
   * Returns the host window that opened or embedded Fireguard.
   * Prefers `window.opener` (popup mode) and falls back to `window.parent` (iframe mode).
   *
   * @returns The host window, or null if Fireguard was opened directly.
   */
  static getHost(): Window | null {
    if (globalThis.window.opener) {
      return globalThis.window.opener as Window;
    }

    if (globalThis.window.parent && globalThis.window.parent !== globalThis.window) {
      return globalThis.window.parent;
    }

    return null;
  }

  /**
   * @description
   * Checks if Fireguard is ready.
   * Returns true when opened as a popup or embedded in an iframe by a host page.
   *
   * @returns Returns true if Fireguard is ready, otherwise false.
   */
  static isReady(): boolean {
    return FireguardHelper.getHost() !== null;
  }

  /**
   * @description
   * Closes Fireguard
   */
  static close(): void {
    window.close();
  }

  /**
   * @description
   * Navigates to specified page
   *
   * @param page - The page to navigate to.
   * @returns A promise that resolves when navigation completes.
   */
  static navigate(page: Page): Promise<void> {
    return goto(`${base}/${page}`, { replaceState: true });
  }
}

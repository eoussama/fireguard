import type { Page } from "../enums/page.enum.ts";
import { goto } from "$app/navigation";

import { resolve } from "$app/paths";



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
   * @returns The host window, or null if Fireguard was opened directly (or is being prerendered).
   */
  static getHost(): Window | null {
    if (!globalThis.window) {
      return null;
    }

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
   * Checks if Fireguard runs in a popup window, which it can close by itself.
   *
   * @returns Returns true when Fireguard was opened as a popup.
   */
  static isPopup(): boolean {
    return Boolean(globalThis.window?.opener);
  }

  /**
   * @description
   * Closes Fireguard, when it runs in a popup window (an embedding page removes the iframe by itself).
   */
  static close(): void {
    if (FireguardHelper.isPopup()) {
      globalThis.window.close();
    }
  }

  /**
   * @description
   * Navigates to the specified page, replacing the current history entry.
   *
   * @param page - The page to navigate to.
   * @returns A promise that resolves when navigation completes (navigation failures are ignored).
   */
  static navigate(page: Page): Promise<void> {
    return goto(resolve(page), { replace: true }).catch(() => {});
  }
}

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
   * Checks if Fireguard is ready.
   *
   * @returns Returns true if Fireguard is ready, otherwise false.
   */
  static isReady(): boolean {
    return Boolean(globalThis.window.opener);
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

import { base } from '$app/paths';
import { goto } from '$app/navigation';

import type { Page } from '../enums/page.enum';

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
	 * @param page The page to navigate to
	 */
	static navigate(page: Page): Promise<void> {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		return goto(`${base}/${page}`, { replaceState: true });
	}
}

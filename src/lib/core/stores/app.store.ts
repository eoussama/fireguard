import { writable } from 'svelte/store';
import { initialAppState } from '../consts/app-store.const';

import type { TFireguardConfig } from '@eoussama/firemitt';
import type { TAppStore } from '../types/app-store.type';

/**
 * @description
 * Represents the application store that manages the application state.
 */
export const appStore: TAppStore = (() => {
	const { subscribe, set, update } = writable(initialAppState);

	return {
		subscribe,

		init: () => set(initialAppState),
		loadConfig: (config: TFireguardConfig) => update((state) => ({ ...state, config })),

		stopLoader: () => update((state) => ({ ...state, loading: false })),
		startLoader: () => update((state) => ({ ...state, loading: true })),

		clearToken: () => update((state) => ({ ...state, token: null })),
		registerToken: (token: string) => update((state) => ({ ...state, token })),

		clearError: () => update((state) => ({ ...state, errorMsg: null })),
		raiseError: (errorMsg: string) => update((state) => ({ ...state, errorMsg }))
	};
})();

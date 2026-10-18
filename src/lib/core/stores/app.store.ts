import type { TFireguardConfig } from "@eoussama/firemitt";
import type { TAppError, TAppStore } from "../types/app-store.type.ts";

import { writable } from "svelte/store";

import { initialAppState } from "../consts/app-store.const.ts";



/**
 * @description
 * Represents the application store that manages the application state.
 */
export const appStore: TAppStore = (() => {
  const { subscribe, set, update } = writable(initialAppState);

  return {
    subscribe,

    init: () => set(initialAppState),
    loadConfig: (config: TFireguardConfig) => update(state => ({ ...state, config })),

    stopLoader: () => update(state => ({ ...state, loading: false })),
    startLoader: () => update(state => ({ ...state, loading: true })),

    clearToken: () => update(state => ({ ...state, token: null })),
    registerToken: (token: string) => update(state => ({ ...state, token })),

    clearError: () => update(state => ({ ...state, errorMsg: null, error: null, retryable: false })),
    raiseError: (errorMsg: string, details?: TAppError) => update(state => ({
      ...state,
      errorMsg,
      error: details?.error ?? null,
      retryable: details?.retryable ?? false,
    })),

    markReported: () => update(state => ({ ...state, reported: true })),
  };
})();

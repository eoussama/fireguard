import type { TFireguardConfig } from "@eoussama/firemitt";
import type { Invalidator, Subscriber, Unsubscriber } from "svelte/store";

import type { TAppState } from "./app-state.type";



/**
 * @description
 * Represents the structure of the application store.
 */
export type TAppStore = {
  /**
   * @description
   * Method to subscribe to changes in the application state.
   */
  subscribe: (
    this: void,
    run: Subscriber<TAppState>,
    invalidate?: Invalidator<TAppState> | undefined,
  ) => Unsubscriber;

  /**
   * @description
   * Method to initialize the application store.
   */
  init: () => void;

  /**
   * @description
   * Method to load the application configuration.
   *
   * @param config The configuration to load.
   */
  loadConfig: (config: TFireguardConfig) => void;

  /**
   * @description
   * Method to stop the loader indicating loading state.
   */
  stopLoader: () => void;

  /**
   * @description
   * Method to start the loader indicating loading state.
   */
  startLoader: () => void;

  /**
   * @description
   * Method to clear the authentication token.
   */
  clearToken: () => void;

  /**
   * @description
   * Method to register the authentication token.
   *
   * @param token The token to register.
   */
  registerToken: (token: string) => void;

  /**
   * @description
   * Method to clear any error message.
   */
  clearError: () => void;

  /**
   * @description
   * Method to raise an error message.
   *
   * @param errorMsg The error message to raise.
   */
  raiseError: (errorMsg: string) => void;
};

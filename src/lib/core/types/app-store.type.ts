import type { IError, TFireguardConfig } from "@eoussama/firemitt";
import type { Subscriber, Unsubscriber } from "svelte/store";

import type { TAppState } from "./app-state.type.ts";



/**
 * @description
 * Details of a failed authentication attempt.
 */
export type TAppError = {
  /**
   * @description
   * The serialized error.
   */
  error: IError;

  /**
   * @description
   * Whether the attempt can be retried in place.
   */
  retryable: boolean;
};

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
   * Method to clear any error.
   */
  clearError: () => void;

  /**
   * @description
   * Method to raise an error.
   *
   * @param errorMsg The error message to show.
   * @param details The details of the failed attempt, if any.
   */
  raiseError: (errorMsg: string, details?: TAppError) => void;

  /**
   * @description
   * Method to mark the result as reported to the host page.
   */
  markReported: () => void;
};

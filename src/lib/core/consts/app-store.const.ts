import type { TAppState } from "../types/app-state.type.ts";



/**
 * @description
 * Represents the initial state of the application.
 */
export const initialAppState: TAppState = {
  /**
   * @description
   * The authentication token. Initialized to null.
   */
  token: null,

  /**
   * @description
   * The application configuration. Initialized to null.
   */
  config: null,

  /**
   * @description
   * Error message if any. Initialized to null.
   */
  errorMsg: null,

  /**
   * @description
   * The serialized error of the last failed attempt. Initialized to null.
   */
  error: null,

  /**
   * @description
   * Whether the last failed attempt can be retried. Initialized to false.
   */
  retryable: false,

  /**
   * @description
   * Whether the result was reported to the host page. Initialized to false.
   */
  reported: false,

  /**
   * @description
   * Indicates whether the application is loading. Initialized to true.
   */
  loading: true,
};

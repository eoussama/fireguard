import type { TNullable } from "@eoussama/core";
import type { IError, TFireguardConfig } from "@eoussama/firemitt";



/**
 * @description
 * Represents the state of the application.
 */
export type TAppState = {
  /**
   * @description
   * Indicates whether the application is loading.
   */
  loading: boolean;

  /**
   * @description
   * The authentication token. Can be null.
   */
  token: TNullable<string>;

  /**
   * @description
   * Error message if any. Can be null.
   */
  errorMsg: TNullable<string>;

  /**
   * @description
   * The serialized error of the last failed authentication attempt, if any.
   */
  error: TNullable<IError>;

  /**
   * @description
   * Whether the last failed authentication attempt can be retried in place.
   */
  retryable: boolean;

  /**
   * @description
   * Whether the result was already reported to the host page.
   */
  reported: boolean;

  /**
   * @description
   * The application configuration. Can be null.
   */
  config: TNullable<TFireguardConfig>;
};

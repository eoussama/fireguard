import type { TNullable } from "@eoussama/core";
import type { TFireguardConfig } from "@eoussama/firemitt";



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
   * The application configuration. Can be null.
   */
  config: TNullable<TFireguardConfig>;
};

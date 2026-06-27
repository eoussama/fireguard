import type { TAppState } from '../types/app-state.type';

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
	 * Indicates whether the application is loading. Initialized to true.
	 */
	loading: true
};

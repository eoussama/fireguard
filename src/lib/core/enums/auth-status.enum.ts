/**
 * @description
 * Enum representing the authentication status.
 */
export enum AuthStatus {
	/**
	 * @description
	 * Pending authentication status.
	 * This is the default state.
	 */
	Pending,

	/**
	 * @description
	 * Successful authentication status.
	 */
	Success,

	/**
	 * @description
	 * Failed authentication status.
	 */
	Failure
}

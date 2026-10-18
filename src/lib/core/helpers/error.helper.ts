import type { TUnsafe } from "@eoussama/core";
import type { IError } from "@eoussama/firemitt";

import { ErrorType } from "@eoussama/firemitt";



/**
 * @description
 * Firebase error codes of attempts that can be retried in place.
 */
const RETRYABLE_CODES = new Set<TUnsafe<string>>([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
  "auth/popup-blocked",
  "auth/network-request-failed",
  "auth/timeout",
]);

/**
 * @description
 * User-friendly messages for common Firebase error codes.
 */
const MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "The sign-in popup was closed. Please try again.",
  "auth/cancelled-popup-request": "The sign-in popup was closed. Please try again.",
  "auth/user-cancelled": "The sign-in was cancelled. Please try again.",
  "auth/popup-blocked": "The sign-in popup was blocked by the browser. Allow popups for this page, then retry.",
  "auth/network-request-failed": "A network error occurred. Check your connection, then retry.",
  "auth/timeout": "The sign-in timed out. Please try again.",
  "auth/unauthorized-domain": "This domain is not authorized for this Firebase project. Add it to the authorized domains in the Firebase console.",
  "auth/operation-not-allowed": "This sign-in provider is not enabled for this Firebase project.",
  "auth/invalid-api-key": "The Firebase API key is invalid.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "The Firebase API key is invalid.",
};

/**
 * @description
 * Helper class for handling authentication errors.
 */
export class ErrorHelper {
  /**
   * @description
   * Returns the error code of an unknown thrown value, if any.
   *
   * @param err The caught error value.
   * @returns The error code.
   */
  static getCode(err: unknown): TUnsafe<string> {
    const code = (err as { code?: unknown })?.code;

    return typeof code === "string" && code.length > 0 ? code : undefined;
  }

  /**
   * @description
   * Extracts a serializable error payload from an unknown thrown value.
   *
   * @param err The caught error value.
   * @returns A plain object matching IError.
   */
  static toPayload(err: unknown): IError {
    if (err && typeof err === "object" && "toObject" in err && typeof err.toObject === "function") {
      return err.toObject() as IError;
    }

    const { name, message } = (err ?? {}) as { name?: unknown; message?: unknown };
    const code = this.getCode(err);

    return {
      type: ErrorType.AuthFailed,
      name: typeof name === "string" && name.length > 0 ? name : "AuthFailedError",
      message: typeof message === "string" && message.length > 0 ? message : "Authentication failed.",
      ...(code ? { code } : {}),
    };
  }

  /**
   * @description
   * Returns a user-friendly message for an unknown thrown value.
   *
   * @param err The caught error value.
   * @returns The message to show.
   */
  static toMessage(err: unknown): string {
    const code = this.getCode(err);

    return (code && MESSAGES[code]) || this.toPayload(err).message;
  }

  /**
   * @description
   * Checks whether the failed attempt can be retried in place.
   *
   * @param err The caught error value.
   * @returns Whether the attempt can be retried.
   */
  static isRetryable(err: unknown): boolean {
    return RETRYABLE_CODES.has(this.getCode(err));
  }
}

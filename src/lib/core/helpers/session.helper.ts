import type { IError } from "@eoussama/firemitt";

import { EventHelper, EventType } from "@eoussama/firemitt";
import { get } from "svelte/store";

import { Page } from "../enums/page.enum.ts";
import { appStore } from "../stores/app.store.ts";
import { AuthHelper } from "./auth.helper.ts";
import { ConfigHelper } from "./config.helper.ts";
import { ErrorHelper } from "./error.helper.ts";
import { FireguardHelper } from "./fireguard.helper.ts";



/**
 * @description
 * Error reported when the user closes the sign-in popup, in the same shape as Firebase's.
 */
const POPUP_CLOSED_ERROR = Object.assign(new Error("Firebase: Error (auth/popup-closed-by-user)."), {
  name: "FirebaseError",
  code: "auth/popup-closed-by-user",
});

/**
 * @description
 * Helper class for the authentication session with the host page.
 *
 * Results are reported to the host exactly once:
 * - a successful sign-in sends `AuthSucceded` right away;
 * - a failure that cannot be retried sends `AuthFailed` right away;
 * - a failure that can be retried (e.g. the sign-in popup was closed or blocked) is kept, the user can retry in place,
 *   and it is only reported (as `AuthFailed`, with its code) when Fireguard is closed;
 * - closing Fireguard without any failure reports `Closed`.
 */
export class SessionHelper {
  /**
   * @description
   * The origin of the host page, used as the target origin of every message.
   */
  private static origin = "*";

  /**
   * @description
   * Whether the result was already reported to the host.
   */
  private static reported = false;

  /**
   * @description
   * Whether a sign-in attempt is in progress.
   */
  private static pending = false;

  /**
   * @description
   * The latest sign-in attempt, results of older attempts are ignored.
   */
  private static attempt: object = {};

  /**
   * @description
   * Starts a new session with the host page.
   *
   * @param origin The origin of the host page.
   */
  static begin(origin: string): void {
    this.origin = origin;
    this.reported = false;
    this.pending = false;
  }

  /**
   * @description
   * Checks whether a host page is waiting for a result.
   *
   * @returns Whether the session is still open.
   */
  static isOpen(): boolean {
    return FireguardHelper.isReady() && !this.reported;
  }

  /**
   * @description
   * Sends a message to the host page, ignoring delivery failures (e.g. the host is gone).
   *
   * @param type The event type.
   * @param data The event payload.
   */
  private static send<T extends object>(type: EventType, data?: T): void {
    try {
      EventHelper.send(type, data, this.origin);
    }
    catch {
      // The host is not reachable anymore, nothing else can be done.
    }
  }

  /**
   * @description
   * Reports the result to the host page, once.
   *
   * @param type The event type.
   * @param data The event payload.
   */
  private static report<T extends object>(type: EventType, data?: T): void {
    if (!this.reported) {
      this.reported = true;
      appStore.markReported();
      this.send(type, data);
    }
  }

  /**
   * @description
   * Signs the user in with the loaded configuration.
   * Called on load, and again (from a click, so that the provider's popup is allowed) when the user retries.
   *
   * @returns A promise that resolves once the attempt is over.
   */
  static async login(): Promise<void> {
    const { config } = get(appStore);

    if (!config || this.pending || this.reported) {
      return;
    }

    const attempt = {};

    this.attempt = attempt;
    let popupClosed!: () => void;

    const closed = new Promise<"closed">((resolve) => {
      popupClosed = () => resolve("closed");
    });

    this.pending = true;
    appStore.clearError();

    const outcome = (async () => {
      ConfigHelper.validate(config);

      return AuthHelper.login(config.firebase, config.provider, { onPopupClosed: popupClosed });
    })().then(token => ({ token }), (error: unknown) => ({ error }));

    const first = await Promise.race([outcome, closed]);

    this.pending = false;

    if (first === "closed") {
      // Firebase only reports the closed popup several seconds later: fail right away, so that the user can retry.
      // A late success of this attempt still counts, unless the user retried in the meantime.
      void outcome.then(late => "token" in late && attempt === this.attempt && !this.pending ? this.succeed(late.token) : undefined);

      return this.fail(POPUP_CLOSED_ERROR);
    }

    return "token" in first ? this.succeed(first.token) : this.fail(first.error);
  }

  /**
   * @description
   * Retries the authentication in place.
   *
   * @returns A promise that resolves once the attempt is over.
   */
  static retry(): Promise<void> {
    this.send(EventType.Retry);

    return this.login();
  }

  /**
   * @description
   * Reports a successful authentication.
   *
   * @param token The authentication token.
   * @returns A promise that resolves once the success page is shown.
   */
  static succeed(token: string): Promise<void> {
    appStore.registerToken(token);
    this.report(EventType.AuthSucceded, { token });

    return FireguardHelper.navigate(Page.Success);
  }

  /**
   * @description
   * Handles a failed authentication.
   *
   * @param err The caught error value.
   * @returns A promise that resolves once the failure page is shown.
   */
  static fail(err: unknown): Promise<void> {
    const error = ErrorHelper.toPayload(err);
    const retryable = ErrorHelper.isRetryable(err) && FireguardHelper.isReady();

    appStore.stopLoader();
    appStore.raiseError(ErrorHelper.toMessage(err), { error, retryable });

    if (!retryable) {
      this.report(EventType.AuthFailed, { error });
    }

    return FireguardHelper.navigate(Page.Failure);
  }

  /**
   * @description
   * Reports a pending failure (or the closing, when no attempt failed) to the host page, if it was not reported yet.
   * Called when the user closes Fireguard, from the Close button or the popup window itself.
   * A pending failure is always reported as `AuthFailed` (cancellations included, with their code), since hosts
   * using Firemitt 0.1.5 and earlier do not handle `Closed`.
   */
  static abandon(): void {
    const { error } = get(appStore);

    if (error) {
      this.report<{ error: IError }>(EventType.AuthFailed, { error });
    }
    else {
      this.report(EventType.Closed);
    }
  }

  /**
   * @description
   * Closes Fireguard, reporting the outcome to the host page first.
   */
  static close(): void {
    this.abandon();
    FireguardHelper.close();
  }
}

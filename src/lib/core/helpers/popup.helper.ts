/**
 * @description
 * Interval in milliseconds between two checks of the sign-in popup.
 */
export const POPUP_POLL_INTERVAL = 250;

/**
 * @description
 * Delay in milliseconds a closed sign-in popup is given to deliver its result before it is considered cancelled.
 * Firebase still needs a network round trip after the popup closes itself on success.
 */
export const POPUP_CLOSED_GRACE = 1500;

/**
 * @description
 * Watches a sign-in popup opened by a third party (Firebase).
 */
export type TPopupWatcher = {
  /**
   * @description
   * Stops watching and restores `window.open`.
   */
  dispose: () => void;
};

/**
 * @description
 * Helper class detecting a sign-in popup closed by the user.
 *
 * Firebase only reports a closed popup several seconds after it was closed (it waits for a late result),
 * which leaves Fireguard looking stuck. This helper captures the next window opened through `window.open`
 * and reports it as closed as soon as it stays closed for a short grace period.
 */
export class PopupHelper {
  /**
   * @description
   * Watches the next popup opened through `window.open`.
   *
   * @param onClosed Called once, when the popup was closed and stayed closed for the grace period.
   * @returns The watcher.
   */
  static watchNext(onClosed: () => void): TPopupWatcher {
    const original = window.open;
    let poller: ReturnType<typeof setInterval> | undefined;
    let grace: ReturnType<typeof setTimeout> | undefined;

    window.open = function open(this: Window, ...args: Parameters<typeof window.open>): ReturnType<typeof window.open> {
      window.open = original;

      const popup = original.apply(this, args);

      if (popup) {
        poller = setInterval(() => {
          if (popup.closed) {
            clearInterval(poller);
            grace = setTimeout(onClosed, POPUP_CLOSED_GRACE);
          }
        }, POPUP_POLL_INTERVAL);
      }

      return popup;
    };

    return {
      dispose: () => {
        window.open = original;
        clearInterval(poller);
        clearTimeout(grace);
      },
    };
  }
}

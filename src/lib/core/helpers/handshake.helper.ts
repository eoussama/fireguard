import type { TFireguardConfig } from "@eoussama/firemitt";

import { EventHelper, EventType } from "@eoussama/firemitt";



/**
 * @description
 * Timing of the handshake, in milliseconds.
 */
export type THandshakeTiming = {
  /**
   * @description
   * Delay before the first Loaded event is announced again.
   */
  initialDelay: number;

  /**
   * @description
   * Maximum delay between two Loaded announcements.
   */
  maxDelay: number;

  /**
   * @description
   * Time after which the host is considered unreachable.
   */
  timeout: number;
};

/**
 * @description
 * Callbacks of the handshake.
 */
export type THandshakeHandlers = {
  /**
   * @description
   * Called once, with the configuration and the origin of the host.
   */
  onConfig: (config: TFireguardConfig, origin: string) => void;

  /**
   * @description
   * Called once, when the host did not answer in time or was closed.
   */
  onTimeout: () => void;
};

/**
 * @description
 * Default timing of the handshake.
 */
export const DEFAULT_HANDSHAKE_TIMING: THandshakeTiming = {
  initialDelay: 100,
  maxDelay: 1000,
  timeout: 15000,
};

/**
 * @description
 * Helper class for the handshake between Fireguard and the host page (Firemitt).
 */
export class HandshakeHelper {
  /**
   * @description
   * Resolves the origin to post messages to from the origin of a received message.
   * Opaque origins ("null") cannot be targeted, in which case "*" is used.
   *
   * @param origin The origin of a received message.
   * @returns The target origin.
   */
  static toTargetOrigin(origin: string | undefined): string {
    return origin && origin !== "null" ? origin : "*";
  }

  /**
   * @description
   * Starts the handshake with the host window.
   *
   * The Config listener is registered first, and only accepts messages posted by the host. Loaded is then announced,
   * and announced again with an exponential backoff until the configuration arrives, so that a message lost while the
   * host was not listening yet (or a slow host) never leaves Fireguard loading forever. The handshake gives up when the
   * host is closed or does not answer in time.
   *
   * @param host The window that opened or embeds Fireguard.
   * @param handlers The handshake callbacks.
   * @param timing The handshake timing.
   * @returns A function that stops the handshake.
   */
  static start(host: Window, handlers: THandshakeHandlers, timing: THandshakeTiming = DEFAULT_HANDSHAKE_TIMING): () => void {
    const startedAt = Date.now();

    let done = false;
    let delay = timing.initialDelay;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const stop = (): void => {
      done = true;
      clearTimeout(timer);
    };

    EventHelper.init(host);
    // The listener is removed once it fires, or when the handshake times out or is stopped.
    EventHelper.on<TFireguardConfig>(EventType.Config, (config, event) => {
      if (config) {
        stop();
        handlers.onConfig(config, HandshakeHelper.toTargetOrigin(event?.origin));
      }
    }, { source: host });

    // Stopping clears the pending announcement, so this never runs once the handshake is over.
    const announce = (): void => {
      if (host.closed || Date.now() - startedAt >= timing.timeout) {
        stop();
        EventHelper.dispose();
        handlers.onTimeout();

        return;
      }

      try {
        EventHelper.send(EventType.Loaded);
      }
      catch {
        // The host may be gone, the next announcement or the timeout handles it.
      }

      timer = setTimeout(announce, delay);
      delay = Math.min(delay * 2, timing.maxDelay);
    };

    announce();

    return () => {
      if (!done) {
        stop();
        EventHelper.dispose();
      }
    };
  }
}

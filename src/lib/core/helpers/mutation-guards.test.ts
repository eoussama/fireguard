import type { TFireguardConfig } from "@eoussama/firemitt";
import { Base64helper, ErrorType, EventHelper, EventType } from "@eoussama/firemitt";
import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { appStore } from "../stores/app.store.ts";
import { ConfigHelper } from "./config.helper.ts";
import { ErrorHelper } from "./error.helper.ts";
import { DEFAULT_HANDSHAKE_TIMING, HandshakeHelper } from "./handshake.helper.ts";



type TListener = (e: MessageEvent) => void;

describe("tests ConfigHelper CSS variables", () => {
  let setProperty: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setProperty = vi.fn();
    vi.stubGlobal("document", { documentElement: { style: { setProperty } } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes the hex, RGB and HSL variables of each color", () => {
    ConfigHelper.load({ name: "App", theme: { text: "#000000", primary: "#ff0000", secondary: "#00ff00", background: "#ffffff" } } as TFireguardConfig);

    expect(setProperty).toHaveBeenCalledWith("--color-primary", "#ff0000");
    expect(setProperty).toHaveBeenCalledWith("--color-primary-rgb", "255,0,0");
    expect(setProperty).toHaveBeenCalledWith("--color-primary-hsl", "0, 100%");
    expect(setProperty).toHaveBeenCalledWith("--color-secondary-hsl", "120, 100%");
    expect(setProperty).toHaveBeenCalledWith("--color-text-hsl", "0, 0%");
  });
});

describe("tests ErrorHelper details", () => {
  const firebaseError = (code: string) => Object.assign(new Error(`Firebase: Error (${code}).`), { name: "FirebaseError", code });

  it.each([
    ["auth/popup-closed-by-user", "The sign-in popup was closed. Please try again."],
    ["auth/cancelled-popup-request", "The sign-in popup was closed. Please try again."],
    ["auth/user-cancelled", "The sign-in was cancelled. Please try again."],
    ["auth/popup-blocked", "The sign-in popup was blocked by the browser. Allow popups for this page, then retry."],
    ["auth/network-request-failed", "A network error occurred. Check your connection, then retry."],
    ["auth/timeout", "The sign-in timed out. Please try again."],
    ["auth/unauthorized-domain", "This domain is not authorized for this Firebase project. Add it to the authorized domains in the Firebase console."],
    ["auth/operation-not-allowed", "This sign-in provider is not enabled for this Firebase project."],
    ["auth/invalid-api-key", "The Firebase API key is invalid."],
    ["auth/api-key-not-valid.-please-pass-a-valid-api-key.", "The Firebase API key is invalid."],
  ])("shows a friendly message for %s", (code, message) => {
    expect(ErrorHelper.toMessage(firebaseError(code))).toBe(message);
  });

  it("ignores empty codes", () => {
    expect(ErrorHelper.getCode({ code: "" })).toBeUndefined();
    expect(Object.keys(ErrorHelper.toPayload({ code: "", message: "m" }))).toEqual(["type", "name", "message"]);
  });

  it("serializes primitive values with defaults", () => {
    expect(ErrorHelper.toPayload("boom")).toEqual({ type: ErrorType.AuthFailed, name: "AuthFailedError", message: "Authentication failed." });
  });

  it("does not call a toObject property that is not a function", () => {
    expect(ErrorHelper.toPayload({ toObject: "nope", name: "Custom", message: "custom" })).toEqual({ type: ErrorType.AuthFailed, name: "Custom", message: "custom" });
  });

  it("uses defaults for empty or non-string names and messages", () => {
    expect(ErrorHelper.toPayload({ name: "", message: "" })).toEqual({ type: ErrorType.AuthFailed, name: "AuthFailedError", message: "Authentication failed." });
    expect(ErrorHelper.toPayload({ name: 42, message: ["m"] })).toEqual({ type: ErrorType.AuthFailed, name: "AuthFailedError", message: "Authentication failed." });
  });
});

describe("tests HandshakeHelper lifecycle", () => {
  let listeners: Set<TListener>;
  let host: { closed: boolean; postMessage: ReturnType<typeof vi.fn> };

  const config = { name: "App" } as TFireguardConfig;
  const dispatch = (e: Partial<MessageEvent>): void => {
    [...listeners].forEach(listener => listener(e as MessageEvent));
  };

  beforeEach(() => {
    vi.useFakeTimers();

    listeners = new Set();
    host = { closed: false, postMessage: vi.fn() };

    vi.stubGlobal("window", {
      addEventListener: vi.fn((_: string, listener: TListener): void => {
        listeners.add(listener);
      }),
      removeEventListener: vi.fn((_: string, listener: TListener): void => {
        listeners.delete(listener);
      }),
    });
  });

  afterEach(() => {
    EventHelper.dispose();
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("uses a 100ms to 1s backoff and a 15s timeout by default", () => {
    expect(DEFAULT_HANDSHAKE_TIMING).toEqual({ initialDelay: 100, maxDelay: 1000, timeout: 15000 });
  });

  it("times out exactly when the timeout is reached", () => {
    const onTimeout = vi.fn();

    HandshakeHelper.start(host as unknown as Window, { onConfig: vi.fn(), onTimeout }, { initialDelay: 100, maxDelay: 100, timeout: 300 });

    vi.advanceTimersByTime(299);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(host.postMessage).toHaveBeenCalledTimes(3);
  });

  it("does not dispose other listeners when stopped after receiving the configuration", () => {
    const stop = HandshakeHelper.start(host as unknown as Window, { onConfig: vi.fn(), onTimeout: vi.fn() });

    dispatch({ isTrusted: true, source: host as unknown as Window, origin: "https://host.example", data: Base64helper.encode({ type: EventType.Config, payload: config }) });
    EventHelper.on(EventType.Retry, vi.fn());
    stop();

    expect(listeners.size).toBe(1);
  });

  it("does not dispose other listeners when stopped after timing out", () => {
    host.closed = true;

    const stop = HandshakeHelper.start(host as unknown as Window, { onConfig: vi.fn(), onTimeout: vi.fn() });

    EventHelper.on(EventType.Retry, vi.fn());
    stop();

    expect(listeners.size).toBe(1);
  });

  it("replies to any origin when the configuration event is not provided", () => {
    const onConfig = vi.fn();
    let callback: ((data?: TFireguardConfig) => void) | undefined;

    vi.spyOn(EventHelper, "on").mockImplementation(((_: EventType, fn: (data?: TFireguardConfig) => void) => {
      callback = fn;

      return EventHelper;
    }) as typeof EventHelper.on);

    HandshakeHelper.start(host as unknown as Window, { onConfig, onTimeout: vi.fn() });
    callback!(config);

    expect(onConfig).toHaveBeenCalledWith(config, "*");
  });
});

describe("tests SessionHelper initial state", () => {
  afterEach(() => {
    vi.doUnmock("./auth.helper.ts");
    vi.doUnmock("./fireguard.helper.ts");
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("starts open, idle, and replies to any origin until a session begins", async () => {
    vi.resetModules();
    vi.doMock("./auth.helper.ts", () => ({ AuthHelper: { login: vi.fn(() => Promise.reject(Object.assign(new Error("denied"), { code: "auth/unauthorized-domain" }))) } }));
    vi.doMock("./fireguard.helper.ts", () => ({ FireguardHelper: { isReady: () => true, close: vi.fn(), navigate: vi.fn(() => Promise.resolve()) } }));
    vi.stubGlobal("window", { addEventListener: vi.fn(), removeEventListener: vi.fn() });

    const { SessionHelper } = await import("./session.helper.ts");
    const { appStore: freshStore } = await import("../stores/app.store.ts");
    const { EventHelper: FreshEventHelper } = await import("@eoussama/firemitt");
    const { AuthHelper } = await import("./auth.helper.ts");
    const host = { postMessage: vi.fn() };

    FreshEventHelper.init(host as unknown as Window);
    freshStore.loadConfig({ name: "App", firebase: { apiKey: "key", authDomain: "domain" } } as TFireguardConfig);

    expect(SessionHelper.isOpen()).toBe(true);

    await SessionHelper.login();

    expect(AuthHelper.login).toHaveBeenCalledTimes(1);
    expect(host.postMessage).toHaveBeenCalledWith(expect.any(String), "*");
    expect(get(freshStore).loading).toBe(false);
  });
});

describe("tests SessionHelper loader", () => {
  it("stops the loader when an attempt fails", async () => {
    vi.resetModules();
    vi.doMock("./fireguard.helper.ts", () => ({ FireguardHelper: { isReady: () => false, close: vi.fn(), navigate: vi.fn(() => Promise.resolve()) } }));

    const { SessionHelper } = await import("./session.helper.ts");
    const { appStore: freshStore } = await import("../stores/app.store.ts");

    freshStore.startLoader();
    await SessionHelper.fail(new Error("boom"));

    expect(get(freshStore).loading).toBe(false);

    vi.doUnmock("./fireguard.helper.ts");
    vi.resetModules();
    appStore.init();
  });
});

import type { TFireguardConfig } from "@eoussama/firemitt";
import { Base64helper, ErrorType, EventHelper, EventType } from "@eoussama/firemitt";
import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Page } from "../enums/page.enum.ts";
import { appStore } from "../stores/app.store.ts";
import { AuthHelper } from "./auth.helper.ts";
import { FireguardHelper } from "./fireguard.helper.ts";
import { SessionHelper } from "./session.helper.ts";



vi.mock("./auth.helper.ts", () => ({ AuthHelper: { login: vi.fn() } }));
vi.mock("./fireguard.helper.ts", () => ({
  FireguardHelper: {
    isReady: vi.fn(() => true),
    close: vi.fn(),
    navigate: vi.fn(() => Promise.resolve()),
  },
}));

const CONFIG = {
  name: "App",
  provider: "google",
  firebase: { apiKey: "key", appId: "app", projectId: "project", authDomain: "project.firebaseapp.com" },
} as TFireguardConfig;

const firebaseError = (code: string) => Object.assign(new Error(`Firebase: Error (${code}).`), { name: "FirebaseError", code });

describe("tests SessionHelper", () => {
  let host: { postMessage: ReturnType<typeof vi.fn> };

  const sent = () => host.postMessage.mock.calls.map(([data, origin]) => ({ ...Base64helper.decode<Record<string, unknown>>(data), origin }));

  beforeEach(() => {
    host = { postMessage: vi.fn() };

    vi.stubGlobal("window", { addEventListener: vi.fn(), removeEventListener: vi.fn() });
    EventHelper.init(host as unknown as Window);

    appStore.init();
    appStore.loadConfig(CONFIG);
    SessionHelper.begin("https://host.example");

    vi.mocked(FireguardHelper.isReady).mockReturnValue(true);
    vi.mocked(FireguardHelper.navigate).mockClear();
    vi.mocked(FireguardHelper.close).mockClear();
    vi.mocked(AuthHelper.login).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports the token to the host origin as soon as the sign-in succeeds", async () => {
    vi.mocked(AuthHelper.login).mockResolvedValue("token");

    await SessionHelper.login();

    expect(sent()).toEqual([{ type: EventType.AuthSucceded, payload: { token: "token" }, origin: "https://host.example" }]);
    expect(get(appStore).token).toBe("token");
    expect(FireguardHelper.navigate).toHaveBeenCalledWith(Page.Success);
    expect(SessionHelper.isOpen()).toBe(false);
  });

  it("reports failures that cannot be retried right away", async () => {
    vi.mocked(AuthHelper.login).mockRejectedValue(firebaseError("auth/unauthorized-domain"));

    await SessionHelper.login();

    expect(sent()).toEqual([expect.objectContaining({
      type: EventType.AuthFailed,
      payload: { error: expect.objectContaining({ type: ErrorType.AuthFailed, code: "auth/unauthorized-domain" }) },
    })]);
    expect(get(appStore)).toMatchObject({ retryable: false, reported: true });
    expect(FireguardHelper.navigate).toHaveBeenCalledWith(Page.Failure);
  });

  it("reports invalid configurations without signing in", async () => {
    appStore.loadConfig({ ...CONFIG, firebase: { ...CONFIG.firebase, apiKey: "" } });

    await SessionHelper.login();

    expect(AuthHelper.login).not.toHaveBeenCalled();
    expect(sent()[0]).toMatchObject({ type: EventType.AuthFailed, payload: { error: { type: ErrorType.InvalidFirebaseConfig } } });
  });

  it("keeps retryable failures, so that a retry can still succeed", async () => {
    vi.mocked(AuthHelper.login).mockRejectedValueOnce(firebaseError("auth/popup-blocked")).mockResolvedValueOnce("token");

    await SessionHelper.login();

    expect(sent()).toEqual([]);
    expect(get(appStore)).toMatchObject({ retryable: true, reported: false });
    expect(SessionHelper.isOpen()).toBe(true);

    await SessionHelper.retry();

    expect(sent().map(message => message.type)).toEqual([EventType.Retry, EventType.AuthSucceded]);
    expect(get(appStore).errorMsg).toBeNull();
  });

  it("does not offer a retry when there is no host", async () => {
    vi.mocked(FireguardHelper.isReady).mockReturnValue(false);
    vi.mocked(AuthHelper.login).mockRejectedValue(firebaseError("auth/popup-blocked"));

    await SessionHelper.login();

    expect(get(appStore).retryable).toBe(false);
  });

  it("reports a cancelled attempt as AuthFailed (with its code) when Fireguard is closed, once", async () => {
    vi.mocked(AuthHelper.login).mockRejectedValue(firebaseError("auth/popup-closed-by-user"));

    await SessionHelper.login();
    SessionHelper.close();
    SessionHelper.abandon();

    expect(sent()).toEqual([expect.objectContaining({ type: EventType.AuthFailed, payload: { error: expect.objectContaining({ code: "auth/popup-closed-by-user" }) } })]);
    expect(get(appStore).reported).toBe(true);
    expect(FireguardHelper.close).toHaveBeenCalled();
  });

  it("reports Closed when Fireguard is closed without any failure", () => {
    SessionHelper.close();

    expect(sent()).toEqual([{ type: EventType.Closed, payload: {}, origin: "https://host.example" }]);
  });

  it("reports a pending retryable failure as AuthFailed when Fireguard is closed", async () => {
    vi.mocked(AuthHelper.login).mockRejectedValue(firebaseError("auth/network-request-failed"));

    await SessionHelper.login();
    SessionHelper.abandon();

    expect(sent()).toEqual([expect.objectContaining({ type: EventType.AuthFailed, payload: { error: expect.objectContaining({ code: "auth/network-request-failed" }) } })]);
  });

  it("ignores concurrent and late sign-in attempts", async () => {
    let resolve!: (token: string) => void;

    vi.mocked(AuthHelper.login).mockReturnValue(new Promise((r) => {
      resolve = r;
    }));

    const first = SessionHelper.login();

    await SessionHelper.login();
    resolve("token");
    await first;
    await SessionHelper.login();

    expect(AuthHelper.login).toHaveBeenCalledTimes(1);
  });

  describe("when the sign-in popup is closed before Firebase reports it", () => {
    let settle: { resolve: (token: string) => void; reject: (error: unknown) => void };
    let popupClosed: () => void;

    beforeEach(() => {
      vi.mocked(AuthHelper.login).mockImplementation((_, __, options) => new Promise((resolve, reject) => {
        settle = { resolve, reject };
        popupClosed = options!.onPopupClosed!;
      }));
    });

    const closeEarly = async (): Promise<void> => {
      const attempt = SessionHelper.login();

      await Promise.resolve();
      popupClosed();
      await attempt;
    };

    it("fails right away with a retryable error, without reporting it", async () => {
      await closeEarly();

      expect(get(appStore)).toMatchObject({
        retryable: true,
        reported: false,
        errorMsg: "The sign-in popup was closed. Please try again.",
        error: { type: ErrorType.AuthFailed, name: "FirebaseError", message: "Firebase: Error (auth/popup-closed-by-user).", code: "auth/popup-closed-by-user" },
      });
      expect(FireguardHelper.navigate).toHaveBeenCalledWith(Page.Failure);
      expect(sent()).toEqual([]);
    });

    it("still accepts a late success of the same attempt", async () => {
      await closeEarly();

      settle.resolve("late-token");
      await vi.waitFor(() => expect(FireguardHelper.navigate).toHaveBeenLastCalledWith(Page.Success));

      expect(sent()).toEqual([expect.objectContaining({ type: EventType.AuthSucceded, payload: { token: "late-token" } })]);
    });

    it("ignores a late result once the user retried", async () => {
      await closeEarly();

      const stale = settle;

      void SessionHelper.retry();
      await Promise.resolve();
      stale.resolve("stale-token");
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(AuthHelper.login).toHaveBeenCalledTimes(2);
      expect(sent().map(message => message.type)).toEqual([EventType.Retry]);
    });

    it("ignores a late success of an attempt replaced by a retry that is over", async () => {
      await closeEarly();

      const stale = settle;
      const retry = SessionHelper.retry();

      await Promise.resolve();
      popupClosed();
      await retry;

      stale.resolve("stale-token");
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(sent().map(message => message.type)).toEqual([EventType.Retry]);
    });

    it("ignores a late failure of the same attempt", async () => {
      await closeEarly();

      settle.reject(new Error("late"));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(FireguardHelper.navigate).toHaveBeenCalledTimes(1);
    });
  });

  it("does nothing without a configuration", async () => {
    appStore.init();

    await SessionHelper.login();

    expect(AuthHelper.login).not.toHaveBeenCalled();
  });

  it("ignores delivery failures", async () => {
    host.postMessage.mockImplementation(() => {
      throw new Error("gone");
    });
    vi.mocked(AuthHelper.login).mockResolvedValue("token");

    await expect(SessionHelper.login()).resolves.toBeUndefined();
  });
});

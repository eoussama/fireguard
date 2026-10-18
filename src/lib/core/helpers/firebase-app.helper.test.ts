import type { TFirebaseConfig } from "@eoussama/firemitt";
import { InvalidAppError } from "@eoussama/firemitt";
import { deleteApp, initializeApp } from "firebase/app";
import { browserPopupRedirectResolver, initializeAuth, inMemoryPersistence } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FirebaseHelper } from "./firebase.helper.ts";



vi.mock("firebase/app", () => ({
  initializeApp: vi.fn((options: { appId?: string; apiKey: string }) => ({ name: options.appId ?? options.apiKey })),
  deleteApp: vi.fn(() => Promise.resolve()),
}));

vi.mock("firebase/auth", async original => ({
  ...await original<typeof import("firebase/auth")>(),
  initializeAuth: vi.fn((app: { name: string }) => ({ app })),
}));

const CREDENTIALS = { apiKey: "key", appId: "app", projectId: "project", authDomain: "project.firebaseapp.com" } as TFirebaseConfig;

describe("tests FirebaseHelper apps", () => {
  beforeEach(async () => {
    await FirebaseHelper.reset();
    vi.mocked(initializeApp).mockClear();
    vi.mocked(initializeAuth).mockClear();
    vi.mocked(deleteApp).mockClear();
  });

  it("initializes the app and an in-memory auth once per app ID", () => {
    const auth = FirebaseHelper.getAuth(CREDENTIALS);

    expect(FirebaseHelper.getAuth(CREDENTIALS)).toBe(auth);
    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(initializeApp).toHaveBeenCalledWith(CREDENTIALS);
    expect(initializeAuth).toHaveBeenCalledTimes(1);
    expect(initializeAuth).toHaveBeenCalledWith({ name: "app" }, {
      persistence: inMemoryPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  });

  it("keys configurations without an app ID by API key", () => {
    FirebaseHelper.getAuth({ ...CREDENTIALS, appId: "" });
    FirebaseHelper.getAuth({ ...CREDENTIALS, appId: "" });
    FirebaseHelper.getAuth({ ...CREDENTIALS, appId: "", apiKey: "other" });

    expect(initializeApp).toHaveBeenCalledTimes(2);
    expect(FirebaseHelper.apps.has("key")).toBe(true);
    expect(FirebaseHelper.apps.has("other")).toBe(true);
  });

  it("reuses the app when only the auth instance is missing", () => {
    FirebaseHelper.getAuth(CREDENTIALS);
    FirebaseHelper.auths.clear();
    FirebaseHelper.getAuth(CREDENTIALS);

    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(initializeAuth).toHaveBeenCalledTimes(2);
  });

  it("throws InvalidAppError when Firebase cannot be initialized", () => {
    vi.mocked(initializeApp).mockImplementationOnce(() => {
      throw new Error("invalid");
    });

    expect(() => FirebaseHelper.getAuth(CREDENTIALS)).toThrow(InvalidAppError);
    expect(FirebaseHelper.auths.has("app")).toBe(false);
  });

  it("deletes every app on reset, ignoring failures", async () => {
    FirebaseHelper.getAuth(CREDENTIALS);
    FirebaseHelper.getAuth({ ...CREDENTIALS, appId: "second" });
    vi.mocked(deleteApp).mockRejectedValueOnce(new Error("already deleted"));

    await expect(FirebaseHelper.reset()).resolves.toBeUndefined();

    expect(deleteApp).toHaveBeenCalledTimes(2);
    expect(FirebaseHelper.apps.values()).toEqual([]);
    expect(FirebaseHelper.auths.values()).toEqual([]);
  });
});

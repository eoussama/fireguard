import type { TFirebaseConfig } from "@eoussama/firemitt";
import type { UserCredential } from "firebase/auth";
import { AuthFailedError } from "@eoussama/firemitt";
import { OAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthHelper } from "./auth.helper.ts";
import { FirebaseHelper } from "./firebase.helper.ts";
import { POPUP_CLOSED_GRACE, POPUP_POLL_INTERVAL } from "./popup.helper.ts";



vi.mock("firebase/auth", async original => ({
  ...await original<typeof import("firebase/auth")>(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

const CREDENTIALS = { apiKey: "key", appId: "app", projectId: "project", authDomain: "project.firebaseapp.com" } as TFirebaseConfig;

/**
 * @description
 * Builds a sign-in result.
 *
 * @param tokenResponse The raw token response of the provider.
 * @returns The sign-in result.
 */
function result(tokenResponse?: Record<string, string>): UserCredential {
  return { _tokenResponse: tokenResponse } as unknown as UserCredential;
}

describe("tests AuthHelper", () => {
  describe("getToken", () => {
    it("prefers the ID token of the credential", () => {
      vi.spyOn(OAuthProvider, "credentialFromResult").mockReturnValueOnce({ idToken: "id", accessToken: "access" } as never);

      expect(AuthHelper.getToken(result())).toBe("id");
    });

    it("falls back to the access token of the credential", () => {
      vi.spyOn(OAuthProvider, "credentialFromResult").mockReturnValueOnce({ accessToken: "access" } as never);

      expect(AuthHelper.getToken(result())).toBe("access");
    });

    it("falls back to the raw token response", () => {
      vi.spyOn(OAuthProvider, "credentialFromResult").mockReturnValue(null);

      expect(AuthHelper.getToken(result({ oauthIdToken: "raw-id", oauthAccessToken: "raw-access" }))).toBe("raw-id");
      expect(AuthHelper.getToken(result({ oauthAccessToken: "raw-access" }))).toBe("raw-access");
      expect(AuthHelper.getToken(result())).toBe("");
    });
  });

  describe("login", () => {
    const auth = { name: "auth" };

    beforeEach(() => {
      vi.stubGlobal("window", { open: vi.fn() });
      vi.spyOn(FirebaseHelper, "reset").mockResolvedValue();
      vi.spyOn(FirebaseHelper, "getAuth").mockReturnValue(auth as never);
      vi.spyOn(OAuthProvider, "credentialFromResult").mockReturnValue(null);
      vi.mocked(signOut).mockReset().mockResolvedValue();
      vi.mocked(signInWithPopup).mockReset();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("reports the sign-in popup as soon as the user closes it, and stops watching once the sign-in settles", async () => {
      vi.useFakeTimers();

      const popup = { closed: false };
      const onPopupClosed = vi.fn();
      let finish!: (credential: UserCredential) => void;

      vi.stubGlobal("window", { open: vi.fn(() => popup) });
      vi.mocked(signInWithPopup).mockImplementation(() => {
        window.open("https://accounts.google.com");

        return new Promise((resolve) => {
          finish = resolve;
        });
      });

      const login = AuthHelper.login(CREDENTIALS, "google", { onPopupClosed });

      await vi.advanceTimersByTimeAsync(0);
      popup.closed = true;
      await vi.advanceTimersByTimeAsync(POPUP_POLL_INTERVAL + POPUP_CLOSED_GRACE);

      expect(onPopupClosed).toHaveBeenCalledTimes(1);

      finish(result({ oauthIdToken: "token" }));

      await expect(login).resolves.toBe("token");
      expect(vi.getTimerCount()).toBe(0);

      vi.useRealTimers();
    });

    it("stops watching the popup when the sign-in settles while it is still open", async () => {
      vi.useFakeTimers();

      const open = vi.fn(() => ({ closed: false }));

      vi.stubGlobal("window", { open });
      vi.mocked(signInWithPopup).mockImplementation(async () => {
        window.open("https://accounts.google.com");

        return result({ oauthIdToken: "token" });
      });

      await AuthHelper.login(CREDENTIALS);

      expect(vi.getTimerCount()).toBe(0);
      expect(window.open).toBe(open);

      vi.useRealTimers();
    });

    it("watches the popup even without a close callback", async () => {
      vi.useFakeTimers();

      const popup = { closed: true };

      vi.stubGlobal("window", { open: vi.fn(() => popup) });
      vi.mocked(signInWithPopup).mockImplementation(async () => {
        window.open("https://accounts.google.com");
        await vi.advanceTimersByTimeAsync(POPUP_POLL_INTERVAL + POPUP_CLOSED_GRACE);

        return result({ oauthIdToken: "token" });
      });

      await expect(AuthHelper.login(CREDENTIALS)).resolves.toBe("token");

      vi.useRealTimers();
    });

    it("resets Firebase, signs in with the requested provider, signs out and returns the token", async () => {
      vi.mocked(signInWithPopup).mockResolvedValue(result({ oauthAccessToken: "token" }));

      await expect(AuthHelper.login(CREDENTIALS, "github")).resolves.toBe("token");

      expect(FirebaseHelper.reset).toHaveBeenCalled();
      expect(FirebaseHelper.getAuth).toHaveBeenCalledWith(CREDENTIALS);
      expect(vi.mocked(signInWithPopup).mock.calls[0][0]).toBe(auth);
      expect(vi.mocked(signInWithPopup).mock.calls[0][1].providerId).toBe("github.com");
      expect(signOut).toHaveBeenCalledWith(auth);
    });

    it("signs in with Google by default", async () => {
      vi.mocked(signInWithPopup).mockResolvedValue(result({ oauthIdToken: "token" }));

      await AuthHelper.login(CREDENTIALS);

      expect(vi.mocked(signInWithPopup).mock.calls[0][1].providerId).toBe("google.com");
    });

    it("ignores sign-out failures", async () => {
      vi.mocked(signInWithPopup).mockResolvedValue(result({ oauthIdToken: "token" }));
      vi.mocked(signOut).mockRejectedValue(new Error("offline"));

      await expect(AuthHelper.login(CREDENTIALS)).resolves.toBe("token");
    });

    it("fails, after signing out, when the provider returned no token", async () => {
      vi.mocked(signInWithPopup).mockResolvedValue(result());

      const error = await AuthHelper.login(CREDENTIALS).catch((e: unknown) => e) as AuthFailedError;

      expect(error).toBeInstanceOf(AuthFailedError);
      expect(error.code).toBe("fireguard/missing-token");
      expect(error.message).toBe("The authentication provider did not return any OAuth token");
      expect(signOut).toHaveBeenCalled();
    });
  });
});

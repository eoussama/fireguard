import type { TFirebaseConfig, TToken } from "@eoussama/firemitt";
import type { UserCredential } from "firebase/auth";

import { AuthFailedError } from "@eoussama/firemitt";
import { OAuthProvider, signInWithPopup, signOut } from "firebase/auth";

import { FirebaseHelper } from "./firebase.helper.ts";
import { PopupHelper } from "./popup.helper.ts";



/**
 * @description
 * Options of a sign-in.
 */
export type TLoginOptions = {
  /**
   * @description
   * Called as soon as the user closes the sign-in popup (Firebase itself only reports it several seconds later).
   */
  onPopupClosed?: () => void;
};

/**
 * @description
 * Helper class for authentication related functionalities.
 */
export class AuthHelper {
  /**
   * @description
   * Extracts the OAuth token of a sign-in result: the provider's ID token when it issues one, its access token otherwise.
   *
   * @param result The sign-in result.
   * @returns The OAuth token, or an empty string when the provider returned none.
   */
  static getToken(result: UserCredential): string {
    const credential = OAuthProvider.credentialFromResult(result);
    const response = (result as unknown as Partial<TToken>)._tokenResponse;

    return credential?.idToken ?? credential?.accessToken ?? response?.oauthIdToken ?? response?.oauthAccessToken ?? "";
  }

  /**
   * @description
   * Logs in the user using Firebase authentication.
   * The Firebase session is signed out right after the token is extracted, Fireguard keeps no session.
   *
   * @param credentials The Firebase configuration.
   * @param provider The authentication provider identifier, see `FirebaseHelper.normalizeProvider` (defaults to "google").
   * @param options The sign-in options.
   * @returns A promise resolving to the authentication token.
   * @throws {InvalidAppError} If the Firebase app is invalid or not initialized.
   * @throws {InvalidProviderError} If the authentication provider is invalid or unknown.
   * @throws {AuthFailedError} If the provider did not return any OAuth token.
   */
  static async login(credentials: TFirebaseConfig, provider?: string, options: TLoginOptions = {}): Promise<string> {
    await FirebaseHelper.reset();

    const authProvider = FirebaseHelper.getProvider(provider);
    const auth = FirebaseHelper.getAuth(credentials);
    const watcher = PopupHelper.watchNext(() => options.onPopupClosed?.());

    let result: UserCredential;

    try {
      result = await signInWithPopup(auth, authProvider);
    }
    finally {
      watcher.dispose();
    }
    const token = AuthHelper.getToken(result);

    await signOut(auth).catch(() => {});

    if (!token) {
      throw new AuthFailedError({
        message: "The authentication provider did not return any OAuth token",
        code: "fireguard/missing-token",
      });
    }

    return token;
  }
}

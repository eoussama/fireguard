import type { TFirebaseConfig, TToken } from "@eoussama/firemitt";

import { InvalidAppError, InvalidProviderError } from "@eoussama/firemitt";
import { signInWithPopup } from "firebase/auth";

import { FirebaseHelper } from "./firebase.helper";



/**
 * @description
 * Helper class for authentication related functionalities.
 */
export class AuthHelper {
  /**
   * @description
   * Logs in the user using Firebase authentication.
   *
   * @param credentials The Firebase configuration.
   * @returns A promise resolving to the authentication token.
   * @throws {InvalidAppError} If the Firebase app is invalid or not initialized.
   * @throws {InvalidProviderError} If the authentication provider is invalid or unknown.
   */
  static async login(credentials: TFirebaseConfig): Promise<string> {
    await FirebaseHelper.reset(credentials.appId);

    const auth = FirebaseHelper.getAuth(credentials);
    if (!auth) {
      throw new InvalidAppError();
    }

    const provider = FirebaseHelper.getProvider();
    if (!provider) {
      throw new InvalidProviderError("unknown");
    }

    const result = await signInWithPopup(auth, provider);
    const token = (result as unknown as TToken)._tokenResponse.oauthIdToken ?? "";

    return token;
  }
}

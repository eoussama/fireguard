import type { TNullable } from "@eoussama/core";
import type { TFirebaseConfig } from "@eoussama/firemitt";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import type { Auth, AuthProvider } from "firebase/auth";

import { EProvider, InvalidAppError } from "@eoussama/firemitt";
import { deleteApp, initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  SAMLAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";

import { CacheHelper } from "./cache.helper";



/**
 * @description
 * Helper class for Firebase related functionalities.
 */
export class FirebaseHelper {
  /**
   * @description
   * Cache for Firebase apps.
   */
  static apps: CacheHelper<FirebaseApp> = new CacheHelper<FirebaseApp>();

  /**
   * @description
   * Cache for Firebase auth instances.
   */
  static auths: CacheHelper<Auth> = new CacheHelper<Auth>();

  /**
   * @description
   * Retrieves or initializes a Firebase app based on provided configuration.
   *
   * @param credentials The Firebase configuration.
   * @returns The Firebase app instance if available, otherwise null.
   */
  private static getApp(credentials: TFirebaseConfig): TNullable<FirebaseApp> {
    if (!this.apps.has(credentials.appId)) {
      const app = initializeApp(credentials as unknown as FirebaseOptions);

      this.apps.set(credentials.appId, app);
    }

    return this.apps.get(credentials.appId);
  }

  /**
   * @description
   * Deletes the Firebase app instance and clears the cache for the given app ID.
   * Call this before retrying sign-in to ensure no stale auth state carries over.
   *
   * @param appId The Firebase app ID to reset.
   * @returns A promise that resolves when the app has been deleted and cache cleared.
   */
  static async reset(appId: string): Promise<void> {
    const app = this.apps.get(appId);

    if (app) {
      await deleteApp(app).catch(() => {});
    }

    this.apps.delete(appId);
    this.auths.delete(appId);
  }

  /**
   * @description
   * Retrieves the Firebase auth instance associated with a Firebase app.
   *
   * @param credentials The Firebase configuration.
   * @returns The Firebase auth instance if available, otherwise null.
   * @throws {InvalidAppError} If the Firebase app is invalid or not initialized.
   */
  static getAuth(credentials: TFirebaseConfig): TNullable<Auth> {
    try {
      if (!this.auths.has(credentials.appId)) {
        const app = this.getApp(credentials);

        if (app) {
          const auth = getAuth(app);

          this.auths.set(credentials.appId, auth);
        }
      }

      return this.auths.get(credentials.appId);
    }
    catch {
      throw new InvalidAppError();
    }
  }

  /**
   * @description
   * Builds a Firebase AuthProvider from a provider identifier string.
   * Supports all Firebase popup-compatible OAuth providers.
   * Pass a custom "oidc.<id>" or "saml.<id>" string for enterprise providers.
   *
   * @param providerId The provider identifier. Defaults to "google".
   * @returns The AuthProvider instance for the given provider.
   */
  static getProvider(providerId: string = EProvider.GOOGLE): AuthProvider {
    if (providerId.startsWith("saml.")) {
      return new SAMLAuthProvider(providerId);
    }

    if (providerId.startsWith("oidc.") || providerId === EProvider.MICROSOFT) {
      const oidcId = providerId === EProvider.MICROSOFT ? "microsoft.com" : providerId;

      return new OAuthProvider(oidcId);
    }

    switch (providerId) {
      case EProvider.GITHUB:
        return new GithubAuthProvider();

      case EProvider.FACEBOOK:
        return new FacebookAuthProvider();

      case EProvider.TWITTER:
        return new TwitterAuthProvider();

      case EProvider.APPLE:
        return new OAuthProvider("apple.com");

      case EProvider.YAHOO:
        return new OAuthProvider("yahoo.com");

      default: {
        const google = new GoogleAuthProvider();

        google.setCustomParameters({ prompt: "select_account" });

        return google;
      }
    }
  }
}

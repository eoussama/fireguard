import type { TUnsafe } from "@eoussama/core";
import type { TFirebaseConfig } from "@eoussama/firemitt";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import type { Auth, AuthProvider } from "firebase/auth";

import { EProvider, InvalidAppError, InvalidProviderError } from "@eoussama/firemitt";
import { deleteApp, initializeApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  initializeAuth,
  inMemoryPersistence,
  OAuthProvider,
  SAMLAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";

import { CacheHelper } from "./cache.helper.ts";



/**
 * @description
 * Firebase provider identifiers accepted as aliases of the built-in providers.
 */
const PROVIDER_ALIASES: Record<string, string> = {
  "google.com": EProvider.GOOGLE,
  "github.com": EProvider.GITHUB,
  "facebook.com": EProvider.FACEBOOK,
  "twitter.com": EProvider.TWITTER,
  "microsoft.com": EProvider.MICROSOFT,
  "apple.com": EProvider.APPLE,
  "yahoo.com": EProvider.YAHOO,
};

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
   * Returns the cache key of a Firebase configuration (older Firemitt versions may not send an app ID).
   *
   * @param credentials The Firebase configuration.
   * @returns The cache key.
   */
  private static getKey(credentials: TFirebaseConfig): string {
    return credentials.appId || credentials.apiKey;
  }

  /**
   * @description
   * Retrieves or initializes a Firebase app based on provided configuration.
   *
   * @param credentials The Firebase configuration.
   * @returns The Firebase app instance.
   */
  private static getApp(credentials: TFirebaseConfig): FirebaseApp {
    const key = this.getKey(credentials);
    let app = this.apps.get(key);

    if (!app) {
      app = initializeApp(credentials as FirebaseOptions);
      this.apps.set(key, app);
    }

    return app;
  }

  /**
   * @description
   * Deletes every Firebase app instance and clears the caches.
   * Called before each sign-in attempt so that no stale app or auth state carries over.
   *
   * @returns A promise that resolves when the apps have been deleted and the caches cleared.
   */
  static async reset(): Promise<void> {
    await Promise.all(this.apps.values().map(app => deleteApp(app).catch(() => {})));

    this.apps.clear();
    this.auths.clear();
  }

  /**
   * @description
   * Retrieves the Firebase auth instance associated with a Firebase app.
   * The auth state is only kept in memory, so no session outlives the Fireguard window.
   *
   * @param credentials The Firebase configuration.
   * @returns The Firebase auth instance.
   * @throws {InvalidAppError} If the Firebase app or its auth instance cannot be initialized.
   */
  static getAuth(credentials: TFirebaseConfig): Auth {
    const key = this.getKey(credentials);
    let auth = this.auths.get(key);

    if (!auth) {
      try {
        auth = initializeAuth(this.getApp(credentials), {
          persistence: inMemoryPersistence,
          popupRedirectResolver: browserPopupRedirectResolver,
        });
      }
      catch {
        throw new InvalidAppError();
      }

      this.auths.set(key, auth);
    }

    return auth;
  }

  /**
   * @description
   * Normalizes a provider identifier: values are trimmed, built-in providers and their Firebase identifiers
   * (e.g. "github.com") are matched case-insensitively, custom "oidc.<id>" / "saml.<id>" identifiers keep their case-sensitive id,
   * and empty values default to "google".
   *
   * @param providerId The provider identifier.
   * @returns The normalized provider identifier.
   */
  static normalizeProvider(providerId: TUnsafe<string>): string {
    const trimmed = (providerId ?? "").trim();
    const lower = trimmed.toLowerCase();

    if (!trimmed) {
      return EProvider.GOOGLE;
    }

    if (lower.startsWith("oidc.") || lower.startsWith("saml.")) {
      return lower.slice(0, 5) + trimmed.slice(5);
    }

    return PROVIDER_ALIASES[lower] ?? lower;
  }

  /**
   * @description
   * Builds a Firebase AuthProvider from a provider identifier string.
   * Supports all Firebase popup-compatible OAuth providers.
   * Pass a custom "oidc.<id>" or "saml.<id>" string for enterprise providers.
   *
   * @param providerId The provider identifier. Defaults to "google".
   * @returns The AuthProvider instance for the given provider.
   * @throws {InvalidProviderError} If the provider identifier is unknown.
   */
  static getProvider(providerId: TUnsafe<string> = EProvider.GOOGLE): AuthProvider {
    const id = this.normalizeProvider(providerId);

    if (id.startsWith("saml.")) {
      return new SAMLAuthProvider(id);
    }

    if (id.startsWith("oidc.")) {
      return new OAuthProvider(id);
    }

    switch (id) {
      case EProvider.GOOGLE: {
        const google = new GoogleAuthProvider();

        google.setCustomParameters({ prompt: "select_account" });

        return google;
      }

      case EProvider.GITHUB:
        return new GithubAuthProvider();

      case EProvider.FACEBOOK:
        return new FacebookAuthProvider();

      case EProvider.TWITTER:
        return new TwitterAuthProvider();

      case EProvider.MICROSOFT:
        return new OAuthProvider("microsoft.com");

      case EProvider.APPLE:
        return new OAuthProvider("apple.com");

      case EProvider.YAHOO:
        return new OAuthProvider("yahoo.com");

      default:
        throw new InvalidProviderError(id);
    }
  }
}

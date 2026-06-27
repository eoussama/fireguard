import type { TFirebaseConfig, TNullable } from "@eoussama/firemitt";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";

import type { Auth, AuthProvider } from "firebase/auth";
import { InvalidAppError } from "@eoussama/firemitt";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
   * Retrieves a GoogleAuthProvider instance with custom parameters.
   *
   * @returns The GoogleAuthProvider instance.
   */
  static getProvider(): AuthProvider {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({ prompt: "select_account" });

    return provider;
  }
}

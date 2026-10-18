import { InvalidProviderError } from "@eoussama/firemitt";
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, OAuthProvider, SAMLAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { describe, expect, it } from "vitest";

import { FirebaseHelper } from "./firebase.helper.ts";



describe("tests FirebaseHelper", () => {
  describe("normalizeProvider", () => {
    it.each([
      [undefined, "google"],
      ["", "google"],
      [" GitHub ", "github"],
      ["github.com", "github"],
      ["Microsoft.com", "microsoft"],
      ["oidc.MyProvider", "oidc.MyProvider"],
      ["SAML.Corp", "saml.Corp"],
      [" OIDC.MyProvider ", "oidc.MyProvider"],
      ["gogle", "gogle"],
    ])("normalizes %j to %j", (input, expected) => {
      expect(FirebaseHelper.normalizeProvider(input)).toBe(expected);
    });
  });

  describe("getProvider", () => {
    it.each([
      ["google", GoogleAuthProvider, "google.com"],
      ["GitHub", GithubAuthProvider, "github.com"],
      ["facebook", FacebookAuthProvider, "facebook.com"],
      ["twitter", TwitterAuthProvider, "twitter.com"],
      ["microsoft", OAuthProvider, "microsoft.com"],
      ["apple", OAuthProvider, "apple.com"],
      ["yahoo", OAuthProvider, "yahoo.com"],
      ["oidc.custom", OAuthProvider, "oidc.custom"],
      ["saml.custom", SAMLAuthProvider, "saml.custom"],
    ])("builds the %s provider", (id, type, providerId) => {
      const provider = FirebaseHelper.getProvider(id);

      expect(provider).toBeInstanceOf(type);
      expect(provider.providerId).toBe(providerId);
    });

    it("defaults to Google with the account selection prompt", () => {
      const provider = FirebaseHelper.getProvider() as GoogleAuthProvider;

      expect(provider).toBeInstanceOf(GoogleAuthProvider);
      expect(provider.getCustomParameters()).toEqual({ prompt: "select_account" });
    });

    it("throws InvalidProviderError for unknown providers instead of silently using Google", () => {
      expect(() => FirebaseHelper.getProvider("gogle")).toThrow(InvalidProviderError);
    });
  });
});

import { ErrorType, InvalidAppError } from "@eoussama/firemitt";
import { describe, expect, it } from "vitest";

import { ErrorHelper } from "./error.helper.ts";



describe("tests ErrorHelper", () => {
  const firebaseError = (code: string) => Object.assign(new Error(`Firebase: Error (${code}).`), { name: "FirebaseError", code });

  it("serializes Firemitt errors with their own type", () => {
    expect(ErrorHelper.toPayload(new InvalidAppError())).toMatchObject({ type: ErrorType.InvalidApp, name: "InvalidAppError" });
  });

  it("serializes other errors as AuthFailed, keeping their name, message and code", () => {
    expect(ErrorHelper.toPayload(firebaseError("auth/unauthorized-domain"))).toEqual({
      type: ErrorType.AuthFailed,
      name: "FirebaseError",
      message: "Firebase: Error (auth/unauthorized-domain).",
      code: "auth/unauthorized-domain",
    });
  });

  it("serializes unexpected values with defaults", () => {
    expect(ErrorHelper.toPayload(undefined)).toEqual({ type: ErrorType.AuthFailed, name: "AuthFailedError", message: "Authentication failed." });
    expect(ErrorHelper.toPayload({ code: 42 })).toEqual({ type: ErrorType.AuthFailed, name: "AuthFailedError", message: "Authentication failed." });
  });

  it("returns friendly messages for known codes, and the error message otherwise", () => {
    expect(ErrorHelper.toMessage(firebaseError("auth/popup-blocked"))).toMatch(/blocked/);
    expect(ErrorHelper.toMessage(firebaseError("auth/some-unknown-error"))).toBe("Firebase: Error (auth/some-unknown-error).");
    expect(ErrorHelper.toMessage(new Error("boom"))).toBe("boom");
  });

  it.each([
    ["auth/popup-closed-by-user", true],
    ["auth/cancelled-popup-request", true],
    ["auth/user-cancelled", true],
    ["auth/popup-blocked", true],
    ["auth/network-request-failed", true],
    ["auth/timeout", true],
    ["auth/unauthorized-domain", false],
  ])("classifies %s (retryable: %s)", (code, retryable) => {
    expect(ErrorHelper.isRetryable(firebaseError(code))).toBe(retryable);
  });

  it("does not retry errors without a code", () => {
    expect(ErrorHelper.isRetryable(new Error("boom"))).toBe(false);
    expect(ErrorHelper.isRetryable(null)).toBe(false);
  });
});

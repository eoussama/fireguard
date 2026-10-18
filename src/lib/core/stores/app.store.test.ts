import type { TFireguardConfig } from "@eoussama/firemitt";
import { ErrorType } from "@eoussama/firemitt";
import { get } from "svelte/store";
import { beforeEach, describe, expect, it } from "vitest";

import { initialAppState } from "../consts/app-store.const.ts";
import { AuthStatus } from "../enums/auth-status.enum.ts";
import { appStore } from "./app.store.ts";



describe("tests appStore", () => {
  beforeEach(() => {
    appStore.init();
  });

  it("starts from the initial state", () => {
    expect(get(appStore)).toEqual({
      token: null,
      config: null,
      errorMsg: null,
      error: null,
      retryable: false,
      reported: false,
      loading: true,
    });
    expect(get(appStore)).toBe(initialAppState);
  });

  it("loads the configuration", () => {
    const config = { name: "App" } as TFireguardConfig;

    appStore.loadConfig(config);

    expect(get(appStore).config).toBe(config);
  });

  it("toggles the loader", () => {
    appStore.stopLoader();
    expect(get(appStore).loading).toBe(false);

    appStore.startLoader();
    expect(get(appStore).loading).toBe(true);
  });

  it("registers and clears the token", () => {
    appStore.registerToken("token");
    expect(get(appStore).token).toBe("token");

    appStore.clearToken();
    expect(get(appStore).token).toBeNull();
  });

  it("raises and clears errors", () => {
    const error = { type: ErrorType.AuthFailed, name: "Error", message: "message" };

    appStore.raiseError("message", { error, retryable: true });
    expect(get(appStore)).toMatchObject({ errorMsg: "message", error, retryable: true });

    appStore.clearError();
    expect(get(appStore)).toMatchObject({ errorMsg: null, error: null, retryable: false });

    appStore.raiseError("no details");
    expect(get(appStore)).toMatchObject({ errorMsg: "no details", error: null, retryable: false });
  });

  it("marks the result as reported", () => {
    appStore.markReported();

    expect(get(appStore).reported).toBe(true);
  });
});

describe("tests AuthStatus", () => {
  it("keeps its values, which name the status icons", () => {
    expect({ ...AuthStatus }).toEqual({ 0: "Pending", 1: "Success", 2: "Failure", Pending: 0, Success: 1, Failure: 2 });
  });
});

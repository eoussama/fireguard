import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Page } from "../enums/page.enum.ts";
import { FireguardHelper } from "./fireguard.helper.ts";



vi.mock("$app/navigation", () => ({ goto: vi.fn(() => Promise.resolve()) }));
vi.mock("$app/paths", () => ({ resolve: vi.fn((path: string) => `/fireguard${path}`) }));

describe("tests FireguardHelper window and navigation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("has no host while prerendering", () => {
    vi.stubGlobal("window", undefined);

    expect(FireguardHelper.getHost()).toBeNull();
    expect(FireguardHelper.isReady()).toBe(false);
    expect(FireguardHelper.isPopup()).toBe(false);
  });

  it("is a popup only when it has an opener", () => {
    vi.stubGlobal("window", { opener: {} });
    expect(FireguardHelper.isPopup()).toBe(true);

    vi.stubGlobal("window", { opener: null, parent: {} });
    expect(FireguardHelper.isPopup()).toBe(false);
  });

  it("closes the window only in a popup", () => {
    const close = vi.fn();

    vi.stubGlobal("window", { opener: null, parent: {}, close });
    FireguardHelper.close();
    expect(close).not.toHaveBeenCalled();

    vi.stubGlobal("window", { opener: {}, close });
    FireguardHelper.close();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("navigates to the resolved page, replacing the history entry", async () => {
    await FireguardHelper.navigate(Page.Failure);

    expect(resolve).toHaveBeenCalledWith("/failure");
    expect(goto).toHaveBeenCalledWith("/fireguard/failure", { replace: true });
  });

  it("ignores navigation failures", async () => {
    vi.mocked(goto).mockRejectedValueOnce(new Error("cannot navigate"));

    await expect(FireguardHelper.navigate(Page.Success)).resolves.toBeUndefined();
  });
});

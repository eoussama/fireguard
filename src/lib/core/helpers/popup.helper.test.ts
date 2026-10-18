import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POPUP_CLOSED_GRACE, POPUP_POLL_INTERVAL, PopupHelper } from "./popup.helper.ts";



describe("tests PopupHelper", () => {
  let popup: { closed: boolean };
  let open: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    popup = { closed: false };
    open = vi.fn(() => popup);

    vi.stubGlobal("window", { open });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("polls every 250ms and gives a closed popup 1.5s to deliver its result", () => {
    expect(POPUP_POLL_INTERVAL).toBe(250);
    expect(POPUP_CLOSED_GRACE).toBe(1500);
  });

  it("reports the next popup as closed once it stayed closed for the grace period", () => {
    const onClosed = vi.fn();

    PopupHelper.watchNext(onClosed);

    expect(window.open("https://accounts.google.com", "_blank", "popup")).toBe(popup);
    expect(open).toHaveBeenCalledWith("https://accounts.google.com", "_blank", "popup");

    vi.advanceTimersByTime(1000);
    expect(onClosed).not.toHaveBeenCalled();

    popup.closed = true;
    vi.advanceTimersByTime(POPUP_POLL_INTERVAL);
    vi.advanceTimersByTime(POPUP_CLOSED_GRACE - 1);
    expect(onClosed).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onClosed).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(10_000);
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it("only watches the next popup and restores window.open right away", () => {
    PopupHelper.watchNext(vi.fn());

    window.open("https://accounts.google.com");

    expect(window.open).toBe(open);
  });

  it("does not report anything once disposed", () => {
    const onClosed = vi.fn();
    const watcher = PopupHelper.watchNext(onClosed);

    window.open("https://accounts.google.com");
    popup.closed = true;
    vi.advanceTimersByTime(POPUP_POLL_INTERVAL);
    watcher.dispose();
    vi.advanceTimersByTime(POPUP_CLOSED_GRACE);

    expect(onClosed).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops polling a popup that is still open once disposed", () => {
    const watcher = PopupHelper.watchNext(vi.fn());

    window.open("https://accounts.google.com");
    vi.advanceTimersByTime(POPUP_POLL_INTERVAL * 2);
    watcher.dispose();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("restores window.open when disposed before any popup was opened", () => {
    PopupHelper.watchNext(vi.fn()).dispose();

    expect(window.open).toBe(open);
  });

  it("ignores a blocked popup", () => {
    const onClosed = vi.fn();

    open.mockReturnValueOnce(null);
    PopupHelper.watchNext(onClosed);

    expect(window.open("https://accounts.google.com")).toBeNull();

    vi.advanceTimersByTime(10_000);
    expect(onClosed).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

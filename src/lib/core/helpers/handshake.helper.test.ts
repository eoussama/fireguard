import type { TFireguardConfig } from "@eoussama/firemitt";
import { Base64helper, EventHelper, EventType } from "@eoussama/firemitt";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HandshakeHelper } from "./handshake.helper.ts";



type TListener = (e: MessageEvent) => void;

const TIMING = { initialDelay: 100, maxDelay: 400, timeout: 2000 };
const CONFIG = { name: "App" } as TFireguardConfig;

describe("tests HandshakeHelper", () => {
  let listeners: Set<TListener>;
  let host: { closed: boolean; postMessage: ReturnType<typeof vi.fn> };

  const dispatch = (e: Partial<MessageEvent>): void => {
    [...listeners].forEach(listener => listener(e as MessageEvent));
  };

  const config = (source: unknown = host, origin = "https://host.example"): Partial<MessageEvent> => ({
    isTrusted: true,
    source: source as Window,
    origin,
    data: Base64helper.encode({ type: EventType.Config, payload: CONFIG }),
  });

  const loadedCount = (): number => host.postMessage.mock.calls.filter(([data]) => Base64helper.decode(data).type === EventType.Loaded).length;

  beforeEach(() => {
    vi.useFakeTimers();

    listeners = new Set();
    host = { closed: false, postMessage: vi.fn() };

    vi.stubGlobal("window", {
      addEventListener: vi.fn((_: string, listener: TListener) => listeners.add(listener)),
      removeEventListener: vi.fn((_: string, listener: TListener) => listeners.delete(listener)),
    });
  });

  afterEach(() => {
    EventHelper.dispose();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("listens for the configuration before announcing Loaded", () => {
    host.postMessage.mockImplementation(() => expect(listeners.size).toBe(1));

    HandshakeHelper.start(host as unknown as Window, { onConfig: vi.fn(), onTimeout: vi.fn() }, TIMING);

    expect(loadedCount()).toBe(1);
  });

  it("announces Loaded again with a capped backoff until the configuration arrives", () => {
    const onConfig = vi.fn();

    HandshakeHelper.start(host as unknown as Window, { onConfig, onTimeout: vi.fn() }, TIMING);

    vi.advanceTimersByTime(100);
    expect(loadedCount()).toBe(2);

    vi.advanceTimersByTime(200);
    expect(loadedCount()).toBe(3);

    vi.advanceTimersByTime(400);
    vi.advanceTimersByTime(400);
    expect(loadedCount()).toBe(5);

    dispatch(config());

    expect(onConfig).toHaveBeenCalledWith(CONFIG, "https://host.example");

    vi.advanceTimersByTime(5000);
    expect(loadedCount()).toBe(5);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("handles the configuration once, ignoring duplicates and other windows", () => {
    const onConfig = vi.fn();

    HandshakeHelper.start(host as unknown as Window, { onConfig, onTimeout: vi.fn() }, TIMING);

    dispatch(config({}));
    expect(onConfig).not.toHaveBeenCalled();

    dispatch(config());
    dispatch(config());

    expect(onConfig).toHaveBeenCalledTimes(1);
  });

  it("ignores a configuration message without a payload", () => {
    const onConfig = vi.fn();

    HandshakeHelper.start(host as unknown as Window, { onConfig, onTimeout: vi.fn() }, TIMING);
    dispatch({ ...config(), data: Base64helper.encode({ type: EventType.Config } as never) });

    expect(onConfig).not.toHaveBeenCalled();
  });

  it("replies to any origin when the host has an opaque origin", () => {
    const onConfig = vi.fn();

    HandshakeHelper.start(host as unknown as Window, { onConfig, onTimeout: vi.fn() }, TIMING);
    dispatch(config(host, "null"));

    expect(onConfig).toHaveBeenCalledWith(CONFIG, "*");
  });

  it("gives up after the timeout", () => {
    const onTimeout = vi.fn();

    HandshakeHelper.start(host as unknown as Window, { onConfig: vi.fn(), onTimeout }, TIMING);

    vi.advanceTimersByTime(1900);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(400);
    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("gives up as soon as the host is closed", () => {
    const onTimeout = vi.fn();

    HandshakeHelper.start(host as unknown as Window, { onConfig: vi.fn(), onTimeout }, TIMING);

    host.closed = true;
    vi.advanceTimersByTime(100);

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("keeps announcing when posting to the host throws", () => {
    host.postMessage.mockImplementation(() => {
      throw new Error("gone");
    });

    expect(() => HandshakeHelper.start(host as unknown as Window, { onConfig: vi.fn(), onTimeout: vi.fn() }, TIMING)).not.toThrow();

    vi.advanceTimersByTime(100);
    expect(host.postMessage).toHaveBeenCalledTimes(2);
  });

  it("stops announcing and listening when stopped, and stopping twice is harmless", () => {
    const stop = HandshakeHelper.start(host as unknown as Window, { onConfig: vi.fn(), onTimeout: vi.fn() }, TIMING);

    stop();
    stop();
    vi.advanceTimersByTime(5000);

    expect(loadedCount()).toBe(1);
    expect(listeners.size).toBe(0);
  });
});

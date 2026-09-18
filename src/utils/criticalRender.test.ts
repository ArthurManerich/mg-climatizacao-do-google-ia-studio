import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubEnv('MODE', 'production');
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('real critical render scheduling', () => {
  it('schedules a loaded document once and shares simultaneous calls', async () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    const idle = vi.fn((callback: () => void) => window.setTimeout(callback, 10));
    vi.stubGlobal('requestIdleCallback', idle);
    vi.stubGlobal('cancelIdleCallback', vi.fn((id: number) => clearTimeout(id)));
    const { waitForCriticalRender } = await import('./criticalRender');
    const first = waitForCriticalRender();
    expect(waitForCriticalRender()).toBe(first);
    const resolved = vi.fn();
    void first.then(resolved);
    expect(resolved).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(10);
    expect(idle).toHaveBeenCalledTimes(1);
    expect(resolved).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('releases normally after load and cleans up', async () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { waitForCriticalRender } = await import('./criticalRender');
    const resolved = vi.fn();
    void waitForCriticalRender().then(resolved);
    await vi.advanceTimersByTimeAsync(50);
    expect(resolved).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('load'));
    await vi.runAllTimersAsync();
    expect(resolved).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('load', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('releases without load at the finite deadline and ignores late load', async () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const { waitForCriticalRender, CRITICAL_RENDER_MAX_WAIT_MS } = await import('./criticalRender');
    const resolved = vi.fn();
    void waitForCriticalRender().then(resolved);
    await vi.advanceTimersByTimeAsync(CRITICAL_RENDER_MAX_WAIT_MS - 1);
    expect(resolved).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('load'));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels a stalled idle callback at the deadline', async () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    vi.stubGlobal('requestIdleCallback', vi.fn(() => 42));
    const cancel = vi.fn();
    vi.stubGlobal('cancelIdleCallback', cancel);
    const { waitForCriticalRender, CRITICAL_RENDER_MAX_WAIT_MS } = await import('./criticalRender');
    const promise = waitForCriticalRender();
    await vi.advanceTimersByTimeAsync(CRITICAL_RENDER_MAX_WAIT_MS);
    await promise;
    expect(cancel).toHaveBeenCalledWith(42);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('resolves without browser globals', async () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);
    const { waitForCriticalRender } = await import('./criticalRender');
    await expect(waitForCriticalRender()).resolves.toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });
});

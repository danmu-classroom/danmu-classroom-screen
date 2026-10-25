import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Danmu } from '../../models';
import { pollDanmus } from './poll-danmus';

const danmu = (content: string) => ({ content }) as Danmu;

describe('pollDanmus', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('delivers non-empty batches and keeps polling after errors', async () => {
    const popDanmus = vi
      .fn<() => Promise<Danmu[]>>()
      .mockResolvedValueOnce([danmu('a')])
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue([danmu('b')]);
    const onDanmus = vi.fn();
    const onError = vi.fn();

    const stop = pollDanmus({ intervalMs: 900, onDanmus, onError, popDanmus });
    await vi.advanceTimersByTimeAsync(900 * 3);
    stop();
    await vi.advanceTimersByTimeAsync(900 * 3);

    expect(popDanmus).toHaveBeenCalledTimes(4);
    expect(onDanmus.mock.calls).toEqual([[[danmu('a')]], [[danmu('b')]]]);
    expect(onError).toHaveBeenCalledWith(new Error('offline'));
  });
});

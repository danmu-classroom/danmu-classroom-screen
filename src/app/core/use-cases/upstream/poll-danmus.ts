import { Danmu } from '../../models';

interface PollDanmusOptions {
  intervalMs: number;
  onDanmus: (danmus: Danmu[]) => void;
  onError: (error: unknown) => void;
  popDanmus: () => Promise<Danmu[]>;
}

// Polls the server for new danmus until the returned stop function is called.
// Errors are reported and polling continues on the next tick.
export function pollDanmus({
  intervalMs,
  onDanmus,
  onError,
  popDanmus,
}: PollDanmusOptions) {
  let timer: NodeJS.Timeout | undefined;
  let stopped = false;

  const tick = async () => {
    try {
      const danmus = await popDanmus();
      if (danmus.length > 0) onDanmus(danmus);
    } catch (error) {
      onError(error);
    }
    if (!stopped) timer = setTimeout(() => void tick(), intervalMs);
  };

  void tick();

  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}

/**
 * Caps how many of `tasks` run at once. Used to stay within a third-party
 * API's requested rate limit (e.g. Scryfall asks for modest concurrency)
 * even when a list of many cards is priced in a single request.
 */
export async function runWithConcurrencyLimit<T>(
  tasks: readonly (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await tasks[index]!();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

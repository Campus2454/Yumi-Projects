import { Cache } from 'cache-manager';

export async function fetchWithCacheAndRetry<T>(
  cacheManager: Cache,
  cacheKey: string,
  ttlMs: number,
  requestFn: () => Promise<T>,
  retries = 3
): Promise<T | null> {
  const cachedData = await cacheManager.get<T>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await requestFn();
    if (data) {
      await cacheManager.set(cacheKey, data, ttlMs);
    }
    return data;
  } catch (error: any) {
    if (error?.response?.status === 429 && retries > 0) {
      const retryAfter = (error.response.headers['retry-after'] || 1) * 1000;
      console.warn(`[Discord 429 Rate Limit] Waiting ${retryAfter}ms before retry... (Key: ${cacheKey})`);
      await new Promise((res) => setTimeout(res, retryAfter));
      return fetchWithCacheAndRetry(cacheManager, cacheKey, ttlMs, requestFn, retries - 1);
    }

    console.error(`[Discord Request Error] Key: ${cacheKey} | Message: ${error?.message}`);
    return null;
  }
}

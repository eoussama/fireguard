import type { TUnsafe } from "@eoussama/core";



/**
 * @description
 * Helper class for caching values.
 *
 * @template T The type of values to be cached.
 */
export class CacheHelper<T> {
  /**
   * @description
   * Caching map.
   */
  private cache: Map<string, T>;

  /**
   * @description
   * Constructs a new instance of CacheHelper.
   */
  constructor() {
    this.cache = new Map();
  }

  /**
   * @description
   * Sets a value in the cache, without overwriting an existing one.
   *
   * @param key The key under which the value is stored.
   * @param value The value to be stored.
   * @returns {boolean} - Returns true if the value was successfully set, otherwise false.
   */
  set(key: string, value: T): boolean {
    if (!this.has(key)) {
      this.cache.set(key, value);

      return true;
    }

    return false;
  }

  /**
   * @description
   * Retrieves a value from the cache.
   *
   * @param key The key of the value to retrieve.
   * @returns Returns the value associated with the key, or undefined if the key does not exist.
   */
  get(key: string): TUnsafe<T> {
    return this.cache.get(key);
  }

  /**
   * @description
   * Checks if a key exists in the cache.
   *
   * @param key The key to check.
   * @returns Returns true if the key exists in the cache, otherwise false.
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * @description
   * Deletes a value from the cache.
   *
   * @param key The key of the value to delete.
   * @returns Returns true if the value was successfully deleted, otherwise false.
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * @description
   * Returns all the cached values.
   *
   * @returns The cached values.
   */
  values(): Array<T> {
    return [...this.cache.values()];
  }

  /**
   * @description
   * Removes every value from the cache.
   */
  clear(): void {
    this.cache.clear();
  }
}

import type { TNullable } from '@eoussama/firemitt';

/**
 * @description
 * Helper class for caching values.
 *
 * @template T The type of values to be cached.
 */
export class CacheHelper<T> {
	/**
	 * @description
	 * Caching object.
	 */
	private cache: { [key: string]: T };

	/**
	 * @description
	 * Constructs a new instance of CacheHelper.
	 */
	constructor() {
		this.cache = {};
	}

	/**
	 * @description
	 * Sets a value in the cache.
	 *
	 * @param key The key under which the value is stored.
	 * @param value The value to be stored.
	 *
	 * @returns {boolean} - Returns true if the value was successfully set, otherwise false.
	 */
	set(key: string, value: T): boolean {
		if (!this.has(key)) {
			this.cache[key] = value;
			return true;
		}

		return false;
	}

	/**
	 * @description
	 * Retrieves a value from the cache.
	 *
	 * @param key The key of the value to retrieve.
	 *
	 * @returns Returns the value associated with the key, or null if the key does not exist.
	 */
	get(key: string): TNullable<T> {
		return this.cache[key];
	}

	/**
	 * @description
	 * Checks if a key exists in the cache.
	 *
	 * @param key The key to check.
	 *
	 * @returns Returns true if the key exists in the cache, otherwise false.
	 */
	has(key: string): boolean {
		return Boolean(this.get(key));
	}

	/**
	 * @description
	 * Deletes a value from the cache.
	 *
	 * @param key The key of the value to delete.
	 *
	 * @returns Returns true if the value was successfully deleted, otherwise false.
	 */
	delete(key: string): boolean {
		if (this.has(key)) {
			delete this.cache[key];
			return true;
		}

		return false;
	}
}

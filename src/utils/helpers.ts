/**
 * Utility functions for the agent framework
 */

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

export function parseJSON<T = any>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function mergeDeep<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key as keyof T] = mergeDeep(
            target[key as keyof T] as any,
            source[key] as any
          );
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = async (retriesLeft: number) => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        if (retriesLeft <= 0) {
          reject(error);
        } else {
          await sleep(delay);
          attempt(retriesLeft - 1);
        }
      }
    };
    attempt(maxRetries);
  });
}

export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMsg?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMsg || `Operation timed out after ${ms}ms`));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

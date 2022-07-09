export function offlineAwait<T>(promise: Promise<T>): Promise<T | void> {
  if (navigator.onLine) {
    return promise;
  }

  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 100);
  });
}

// Stub for @sentry/nextjs - used when the package is not installed
export function captureException() {}
export function withScope(cb: (scope: unknown) => void) {
  cb({
    setExtra: () => {},
    setTag: () => {},
    setLevel: () => {},
  });
}
export function setUser() {}
export function init() {}
export function close() {}
export function flush() {}
export function startSpan() {}
export function getCurrentScope() {
  return { setExtra: () => {}, setTag: () => {} };
}

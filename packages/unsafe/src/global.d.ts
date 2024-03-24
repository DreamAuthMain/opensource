declare namespace globalThis {
  interface Error {
    code?: unknown;
    cause?: unknown;
  }
}

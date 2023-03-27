import { base64UrlEncode } from '@dreamauth/base64url-encode';

const createPkceVerifier = (length = 128): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(Math.min(128, Math.max(43, length)) || 128));
  return base64UrlEncode(bytes).slice(0, bytes.length);
};

const createPkceChallenge = async (verifier: string): Promise<string> => {
  const bytes = new TextEncoder().encode(verifier);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return base64UrlEncode(digest);
};

export { createPkceChallenge, createPkceVerifier };

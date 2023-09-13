import { webcrypto } from 'node:crypto';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { Pkce } from './pkce.js';

const mockBytes = new Uint8Array([
  93, 163, 135, 168, 238, 82, 183, 225, 57, 98, 127, 181, 230, 81, 139, 235, 60, 63, 25, 220, 251, 191, 93, 133, 227,
  167, 251, 4, 134, 22, 91, 84, 130, 42, 224, 116, 155, 0, 222, 161, 85, 176, 113, 248, 147, 227, 118, 111, 101, 103, 8,
  94, 209, 72, 227, 15, 34, 110, 4, 243, 218, 47, 134, 75, 4, 125, 70, 150, 180, 61, 94, 40, 188, 174, 131, 252, 163,
  151, 96, 6, 186, 64, 80, 15, 100, 144, 148, 184, 235, 167, 211, 191, 222, 205, 114, 31, 8, 70, 203, 99, 195, 118, 226,
  170, 195, 115, 25, 167, 174, 57, 41, 55, 23, 51, 213, 252, 195, 77, 175, 247, 162, 124, 79, 70, 112, 18, 119, 125,
]);

describe('PkceFactory', () => {
  beforeEach(() => {
    vi.spyOn(webcrypto, 'getRandomValues').mockImplementation((array) => {
      return mockBytes.slice(0, new Uint8Array(array.byteLength).length);
    });
  });

  test('createVerifier', async () => {
    const pkce = new Pkce();
    let verifier: string;

    verifier = await pkce.createVerifier(96);
    expect(verifier).toMatchInlineSnapshot(
      '"XaOHqO5St-E5Yn-15lGL6zw_Gdz7v12F46f7BIYWW1SCKuB0mwDeoVWwcfiT43ZvZWcIXtFI4w8ibgTz2i-GSwR9Rpa0PV4ovK6D_KOXYAa6QFAPZJCUuOun07_ezXIf"',
    );

    verifier = await pkce.createVerifier(128);
    expect(verifier).toMatchInlineSnapshot(
      '"XaOHqO5St-E5Yn-15lGL6zw_Gdz7v12F46f7BIYWW1SCKuB0mwDeoVWwcfiT43ZvZWcIXtFI4w8ibgTz2i-GSwR9Rpa0PV4ovK6D_KOXYAa6QFAPZJCUuOun07_ezXIfCEbLY8N24qrDcxmnrjkpNxcz1fzDTa_3onxPRnASd30"',
    );

    verifier = await pkce.createVerifier();
    expect(verifier).toMatchInlineSnapshot(
      '"XaOHqO5St-E5Yn-15lGL6zw_Gdz7v12F46f7BIYWW1SCKuB0mwDeoVWwcfiT43ZvZWcIXtFI4w8ibgTz2i-GSwR9Rpa0PV4ovK6D_KOXYAa6QFAPZJCUuOun07_ezXIfCEbLY8N24qrDcxmnrjkpNxcz1fzDTa_3onxPRnASd30"',
    );
  });

  test('createChallenge', async () => {
    const pkce = new Pkce();
    const challenge = await pkce.createChallenge(
      'XaOHqO5St-E5Yn-15lGL6zw_Gdz7v12F46f7BIYWW1SCKuB0mwDeoVWwcfiT43ZvZWcIXtFI4w8ibgTz2i-GSwR9Rpa0PV4ovK6D_KOXYAa6QFAPZJCUuOun07_ezXIf',
    );

    expect(challenge).toBe('SymxQ48IZBLnrAdBCmR6M6bHjSIra9zbPxtDophLeuY');
  });
});

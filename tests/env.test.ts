import { describe, expect, it } from 'vitest';
import { editLinkBaseUrl, parseBuildEnv } from '../src/lib/env';

describe('parseBuildEnv', () => {
  it('treats missing and empty values as unset', () => {
    const env = parseBuildEnv({ PUBLIC_REPO_URL: '', PUBLIC_SITE_URL: undefined });

    expect(env.PUBLIC_REPO_URL).toBeUndefined();
    expect(env.PUBLIC_SITE_URL).toBeUndefined();
    expect(editLinkBaseUrl(env)).toBeUndefined();
  });

  it('builds the edit link base from the repo URL and branch', () => {
    const env = parseBuildEnv({ PUBLIC_REPO_URL: 'https://github.com/acme/handbook/' });

    expect(editLinkBaseUrl(env)).toBe('https://github.com/acme/handbook/edit/main/');
  });

  it('rejects values that are not http(s) URLs', () => {
    expect(() => parseBuildEnv({ PUBLIC_SITE_URL: 'handbook.example.com' })).toThrow(
      /PUBLIC_SITE_URL/,
    );
  });
});

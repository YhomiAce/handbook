import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkLinks } from '../src/lib/link-check';

const distDir = path.resolve(import.meta.dirname, '..', 'dist');

describe('built site (dist/)', () => {
  it('exists (run `npm run build` before `npm test`)', () => {
    expect(existsSync(distDir), `${distDir} not found`).toBe(true);
  });

  it('has no broken internal links or anchors', async () => {
    const { broken, checked, pages } = await checkLinks(distDir);

    expect(pages).toBeGreaterThanOrEqual(15);
    expect(checked).toBeGreaterThan(100);
    expect(broken).toEqual([]);
  });

  it('includes the Pagefind search index and a 404 page', async () => {
    const pagefind = await readdir(path.join(distDir, 'pagefind'));

    expect(pagefind).toContain('pagefind.js');
    expect(existsSync(path.join(distDir, '404.html'))).toBe(true);
  });
});

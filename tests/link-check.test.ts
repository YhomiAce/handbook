import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { checkLinks, extractLinks, isInternalLink } from '../src/lib/link-check';

describe('extractLinks', () => {
  it('reads href and src attributes but ignores code blocks', () => {
    const html = `<a href="/a/">A</a><img src='/b.svg'><pre><a href="/in-code/">x</a></pre>`;

    expect(extractLinks(html)).toEqual(['/a/', '/b.svg']);
  });
});

describe('isInternalLink', () => {
  it.each([
    ['/operations/on-call/', true],
    ['../rollback/', true],
    ['#severity-levels', true],
    ['https://example.com', false],
    ['mailto:eng@example.com', false],
    ['//cdn.example.com/x.js', false],
    ['data:image/svg+xml,abc', false],
  ])('%s -> %s', (link, expected) => {
    expect(isInternalLink(link)).toBe(expected);
  });
});

describe('checkLinks on a fixture site', () => {
  let dir = '';

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'handbook-links-'));
    await mkdir(path.join(dir, 'guide'), { recursive: true });
    await writeFile(
      path.join(dir, 'index.html'),
      `<a href="/guide/">ok</a><a href="/guide/#intro">ok anchor</a>
       <a href="/guide/#nope">bad anchor</a><a href="/missing/">bad page</a>
       <a href="https://example.com/">external</a>`,
    );
    await writeFile(path.join(dir, 'guide', 'index.html'), `<h2 id="intro">Intro</h2><a href="../">up</a>`);
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reports missing pages and missing anchors only', async () => {
    const result = await checkLinks(dir);

    expect(result.pages).toBe(2);
    expect(result.checked).toBe(5);
    expect(result.broken).toEqual([
      { page: 'index.html', link: '/guide/#nope', reason: 'missing-anchor' },
      { page: 'index.html', link: '/missing/', reason: 'missing-page' },
    ]);
  });
});

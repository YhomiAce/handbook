import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

/** A link found in a built HTML page that doesn't resolve to a file or anchor in the build. */
export interface BrokenLink {
  /** Page containing the link, relative to the build directory. */
  page: string;
  /** The raw attribute value as it appears in the HTML. */
  link: string;
  /** Why the link is considered broken. */
  reason: 'missing-page' | 'missing-anchor';
}

const ATTR_PATTERN = /\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const ID_PATTERN = /\sid\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const SKIPPED_SCHEMES = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/**
 * Extracts `href` and `src` values from an HTML document. Code blocks are
 * stripped first so example markup in documentation isn't treated as a link.
 *
 * @param html - The HTML source.
 * @returns Decoded attribute values, in document order.
 */
export function extractLinks(html: string): string[] {
  const withoutCode = html.replace(/<pre[\s\S]*?<\/pre>/gi, '');
  const links: string[] = [];
  for (const match of withoutCode.matchAll(ATTR_PATTERN)) {
    const value = match[1] ?? match[2] ?? '';
    links.push(value.replace(/&amp;/g, '&').trim());
  }
  return links;
}

/**
 * Extracts every element `id` from an HTML document, for validating `#fragment` links.
 *
 * @param html - The HTML source.
 * @returns The set of ids present in the document.
 */
export function extractIds(html: string): Set<string> {
  const ids = new Set<string>();
  for (const match of html.matchAll(ID_PATTERN)) {
    ids.add(match[1] ?? match[2] ?? '');
  }
  return ids;
}

/**
 * Reports whether a link points inside the site (as opposed to an external
 * URL, `mailto:`, `data:`, or a protocol-relative URL).
 *
 * @param link - A raw `href`/`src` value.
 */
export function isInternalLink(link: string): boolean {
  return link !== '' && !SKIPPED_SCHEMES.test(link);
}

/**
 * Maps a site path (e.g. `/operations/on-call/`) to the candidate files a static
 * server would serve for it, mirroring nginx's `try_files $uri $uri/index.html`.
 *
 * @param distDir - Absolute path of the build directory.
 * @param sitePath - Decoded URL path, starting with `/`.
 * @returns Candidate absolute file paths, most specific first.
 */
export function candidateFiles(distDir: string, sitePath: string): string[] {
  const target = path.join(distDir, sitePath);
  if (sitePath.endsWith('/')) return [path.join(target, 'index.html')];
  return [target, path.join(target, 'index.html'), `${target}.html`];
}

async function isFile(file: string): Promise<boolean> {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function listHtmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

/**
 * Checks every internal link and asset reference in a static build.
 *
 * Relative links are resolved against the page's URL, query strings are
 * ignored, and `#fragment` links are checked against the target page's ids.
 *
 * @param distDir - Absolute path of the build directory (e.g. `dist/`).
 * @returns The broken links found, and how many internal links were checked.
 */
export async function checkLinks(
  distDir: string,
): Promise<{ broken: BrokenLink[]; checked: number; pages: number }> {
  const pages = await listHtmlFiles(distDir);
  const idCache = new Map<string, Set<string>>();
  const idsFor = async (file: string): Promise<Set<string>> => {
    let ids = idCache.get(file);
    if (!ids) {
      ids = extractIds(await readFile(file, 'utf8'));
      idCache.set(file, ids);
    }
    return ids;
  };

  const broken: BrokenLink[] = [];
  let checked = 0;

  for (const page of pages) {
    const relPage = path.relative(distDir, page);
    const pageUrl = new URL(
      `/${relPage.split(path.sep).join('/')}`.replace(/index\.html$/, ''),
      'http://handbook.local',
    );
    const html = await readFile(page, 'utf8');

    for (const link of extractLinks(html)) {
      if (!isInternalLink(link)) continue;
      checked += 1;

      const url = new URL(link, pageUrl);
      const sitePath = decodeURIComponent(url.pathname);
      let target: string | undefined;
      for (const candidate of candidateFiles(distDir, sitePath)) {
        if (await isFile(candidate)) {
          target = candidate;
          break;
        }
      }
      if (!target) {
        broken.push({ page: relPage, link, reason: 'missing-page' });
        continue;
      }

      const fragment = decodeURIComponent(url.hash.slice(1));
      if (fragment && target.endsWith('.html') && !(await idsFor(target)).has(fragment)) {
        broken.push({ page: relPage, link, reason: 'missing-anchor' });
      }
    }
  }

  return { broken, checked, pages: pages.length };
}

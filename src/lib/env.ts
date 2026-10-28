import { z } from 'zod';

/** An optional absolute http(s) URL; empty strings count as "unset". */
const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .pipe(
    z
      .url({ protocol: /^https?$/, message: 'must be an absolute http(s) URL' })
      .transform((value) => value.replace(/\/+$/, ''))
      .optional(),
  )
  .optional();

const buildEnvSchema = z.object({
  PUBLIC_REPO_URL: optionalUrl,
  PUBLIC_SITE_URL: optionalUrl,
  PUBLIC_REPO_BRANCH: z.string().trim().min(1).default('main'),
});

/** Validated build-time configuration for the handbook. */
export type BuildEnv = z.infer<typeof buildEnvSchema>;

/**
 * Parses and validates the build-time environment variables.
 *
 * @param source - The environment to read, usually `process.env`.
 * @returns The validated configuration, with trailing slashes stripped from URLs.
 * @throws Error with a readable message when a variable is malformed.
 */
export function parseBuildEnv(source: Record<string, string | undefined>): BuildEnv {
  const result = buildEnvSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid build environment:\n${details}`);
  }
  return result.data;
}

/**
 * Builds the base URL Starlight prefixes to each page's source path for
 * "Edit this page" links, or `undefined` when no repository is configured.
 *
 * @param env - The validated build environment.
 * @returns e.g. `https://github.com/acme/handbook/edit/main/`, or `undefined`.
 */
export function editLinkBaseUrl(env: BuildEnv): string | undefined {
  if (!env.PUBLIC_REPO_URL) return undefined;
  return `${env.PUBLIC_REPO_URL}/edit/${env.PUBLIC_REPO_BRANCH}/`;
}

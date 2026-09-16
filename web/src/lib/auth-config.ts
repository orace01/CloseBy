// Auth settings read from the environment, safe to import from any server file.

/**
 * Email confirmation and password reset need a working email provider.
 * Until a domain and provider are set up, deployments can turn them off with
 * AUTH_REQUIRE_EMAIL_VERIFICATION=false. Defaults to on.
 */
export const emailFlowsEnabled = process.env.AUTH_REQUIRE_EMAIL_VERIFICATION !== "false";

/** Public URL of the app, used in email links and origin checks. */
export const appBaseUrl =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

/** Preview deployments get their own URL on Vercel; trust it as well. */
export const trustedOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter((host): host is string => Boolean(host))
  .map((host) => `https://${host}`);

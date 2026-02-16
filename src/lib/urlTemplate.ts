export type Primitive = string | number | boolean;
export type Params = Record<string, Primitive | null | undefined>;

/**
 * Replaces `{key}` placeholders in a template with URL-encoded values.
 * Throws if a placeholder value is missing/null/empty.
 */
export function applyTemplate(template: string, vars: Params): string {
  return template.replace(/\{([^}]+)\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    const val = vars[key];
    if (val === undefined || val === null || String(val).length === 0) {
      throw new Error(`Missing template variable: {${key}}`);
    }
    return encodeURIComponent(String(val));
  });
}

/**
 * Converts params to a query string. Skips null/undefined.
 * Uses URLSearchParams for correct encoding.
 */
export function toQueryString(params: Params): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s.length ? `?${s}` : "";
}

/**
 * Builds a URL from a template and params:
 * - Fill `{vars}` using `pathVars`
 * - Append remaining `queryParams` to the URL as a query string
 *
 * (You decide what goes into pathVars vs queryParams.)
 */
export function buildUrl(opts: {
  template: string;
  pathVars: Params;
  queryParams?: Params;
}): string {
  const base = applyTemplate(opts.template, opts.pathVars);
  return base + toQueryString(opts.queryParams ?? {});
}

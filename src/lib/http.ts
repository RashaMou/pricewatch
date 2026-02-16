export type HeadersInitLike = Record<string, string>;

const DEFAULT_HEADERS: HeadersInitLike = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

export class HttpError extends Error {
  public readonly status: number;
  public readonly url: string;
  public readonly bodySnippet?: string;

  constructor(opts: {
    status: number;
    url: string;
    message?: string;
    bodySnippet?: string;
  }) {
    super(opts.message ?? `Request failed (${opts.status})`);
    this.name = "HttpError";
    this.status = opts.status;
    this.url = opts.url;
    this.bodySnippet = opts.bodySnippet;
  }
}

export type FetchJsonOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: HeadersInitLike;
  jsonBody?: unknown;
  onResponse?: (info: { url: string; status: number; ok: boolean }) => void;
};

async function readBodySnippet(
  res: Response,
  limit = 2000,
): Promise<string | undefined> {
  try {
    const text = await res.text();
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  } catch {
    return undefined;
  }
}

export async function fetchJson<T = unknown>(
  url: string,
  opts: FetchJsonOptions = {},
): Promise<T> {
  const method = opts.method ?? "GET";

  const headers: HeadersInitLike = {
    ...DEFAULT_HEADERS,
    ...(opts.headers ?? {}),
  };

  let body: string | undefined;
  if (opts.jsonBody !== undefined) {
    body = JSON.stringify(opts.jsonBody);

    if (!("Content-Type" in headers)) {
      headers["Content-Type"] = "application/json";
    }

    if (!("Accept" in headers)) {
      headers["Accept"] = "application/json";
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  opts.onResponse?.({ url, status: res.status, ok: res.ok });

  if (!res.ok) {
    const snippet = await readBodySnippet(res);
    throw new HttpError({
      status: res.status,
      url,
      message: `Request failed (${res.status}) ${method} ${url}`,
      bodySnippet: snippet,
    });
  }

  if (res.status === 204) return undefined as T;

  try {
    return (await res.json()) as T;
  } catch {
    const snippet = await readBodySnippet(res);
    throw new Error(
      `Expected JSON but failed to parse response for ${method} ${url}.` +
        (snippet ? ` Body starts with: ${snippet}` : ""),
    );
  }
}

import { z } from "zod";
import { loadProviderUrls } from "../lib/config.js";
import type { Provider, Snapshot } from "../types.js";
import { fetchJson } from "../lib/http.js";
import { applyTemplate, toQueryString } from "../lib/urlTemplate.js";

export const GarminConfigSchema = z.object({
  sku: z.string().min(1),
  country: z.string().min(2).optional(),
  locale: z.string().min(2).optional(),
  customerGroup: z.string().min(1).optional(),
});
export type GarminConfig = z.infer<typeof GarminConfigSchema>;

const providerUrls = loadProviderUrls();

type GarminPriceResponse = {
  salePrice: null | { price: number };
  listPrice: { price: number; currencyCode: string };
};

function buildGarminUrl(config: GarminConfig) {
  const template = providerUrls.garmin.template;
  const defaults = providerUrls.garmin.defaultQuery ?? {};

  const country = config.country ?? defaults.country ?? "US";
  const locale = config.locale ?? defaults.locale ?? "en-US";
  const customerGroup =
    config.customerGroup ?? defaults.customerGroup ?? "none";

  const baseUrl = applyTemplate(template, { country, sku: config.sku });

  const qs = toQueryString({ locale, customerGroup });
  return `${baseUrl}${qs}`;
}

function parseGarminSnapshot(json: GarminPriceResponse): Snapshot {
  const list = json.listPrice.price;
  const current = json.salePrice?.price ?? list;

  return {
    currentPrice: current,
    listPrice: list,
    currency: json.listPrice.currencyCode,
  };
}

export const garminProvider: Provider<GarminConfig> = {
  schema: GarminConfigSchema,

  async fetch(config): Promise<Snapshot> {
    const url = buildGarminUrl(config);

    const json = await fetchJson<GarminPriceResponse>(url);

    return parseGarminSnapshot(json);
  },
};

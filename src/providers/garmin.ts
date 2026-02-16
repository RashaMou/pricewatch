import { z } from "zod";
import { loadProviderUrls } from "../lib/config.js";
import type { Provider, Snapshot } from "../types.js";

export const GarminConfigSchema = z.object({
  sku: z.string().min(1),
  country: z.string().min(2).optional(),
  locale: z.string().min(2).optional(),
  customerGroup: z.string().min(1).optional(),
});
export type GarminConfig = z.infer<typeof GarminConfigSchema>;

const providerUrls = loadProviderUrls();

export const garminProvider: Provider<GarminConfig> = {
  schema: GarminConfigSchema,

  async fetch(config): Promise<Snapshot> {
    const template = providerUrls.garmin.template;
    const defaults = providerUrls.garmin.defaultQuery ?? {};

    const country = config.country ?? defaults.country ?? "US";
    const locale = config.locale ?? defaults.locale ?? "en-US";
    const customerGroup =
      config.customerGroup ?? defaults.customerGroup ?? "none";

    const baseUrl = template
      .replace("{country}", country)
      .replace("{sku}", config.sku);

    const url = `${baseUrl}?locale=${locale}&customerGroup=${customerGroup}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Dest": "document",
      },
    });
    if (!res.ok) throw new Error(`Garmin request failed (${res.status})`);

    const json = await res.json();

    const onSale = json.salePrice !== null;

    return {
      onSale,
      currentPrice: onSale ? json.salePrice.price : json.listPrice.price,
      listPrice: json.listPrice.price,
      currency: json.listPrice.currencyCode,
    };
  },
};

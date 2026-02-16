import { z } from "zod";

export type Snapshot = {
  onSale: boolean;
  currentPrice?: number;
  listPrice?: number;
  currency?: string;
};

export type WatchRule =
  | { type: "anySale" }
  | { type: "belowPrice"; value: number };

export type WatchConfig = {
  id: string;
  provider: string;
  config: unknown;
  rule?: WatchRule;
};

export type Provider<TConfig> = {
  schema: z.ZodType<TConfig>;
  fetch: (config: TConfig) => Promise<Snapshot>;
};

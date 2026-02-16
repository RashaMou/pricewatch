export type WatchConfig = {
  id: string;
  provider: string;
  config: Record<string, any>;
  rule?: { type: string; value?: number };
};

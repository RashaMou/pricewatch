import type { Snapshot } from "../types.js";

export type AnySaleRule = {
  type: "anySale";
};

export type SaleEvent =
  | { kind: "SALE_STARTED"; watchId: string; snapshot: Snapshot }
  | { kind: "SALE_ENDED"; watchId: string; snapshot: Snapshot };

export type RuleState = {
  active: boolean; // "rule currently true"
  updatedAt?: string;
};

export type EvaluateResult = {
  nextState: RuleState;
  events: SaleEvent[];
};

/**
 * "On sale" is derived from normalized snapshot facts:
 * currentPrice < listPrice
 */
export function isOnSale(snapshot: Snapshot): boolean {
  return snapshot.currentPrice < snapshot.listPrice;
}

/**
 * Evaluates anySale + produces transition events:
 * - false -> true  => SALE_STARTED
 * - true  -> false => SALE_ENDED
 */
export function evaluateAnySale(opts: {
  watchId: string;
  rule: AnySaleRule;
  snapshot: Snapshot;
  prevState?: RuleState;
  nowIso?: string;
}): EvaluateResult {
  const nowIso = opts.nowIso ?? new Date().toISOString();

  const prevActive = opts.prevState?.active ?? false;
  const active = isOnSale(opts.snapshot);

  const events: SaleEvent[] = [];
  if (!prevActive && active) {
    events.push({
      kind: "SALE_STARTED",
      watchId: opts.watchId,
      snapshot: opts.snapshot,
    });
  } else if (prevActive && !active) {
    events.push({
      kind: "SALE_ENDED",
      watchId: opts.watchId,
      snapshot: opts.snapshot,
    });
  }

  return {
    nextState: { active, updatedAt: nowIso },
    events,
  };
}

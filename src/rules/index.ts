// src/rules/index.ts
import type { Snapshot } from "../types.js";
import {
  evaluateAnySale,
  type AnySaleRule,
  type EvaluateResult,
  type RuleState,
} from "./anySale.js";

export type Rule = AnySaleRule;

export type RuleEngineInput = {
  watchId: string;
  rule: Rule;
  snapshot: Snapshot;
  prevState?: RuleState;
  nowIso?: string;
};

export function evaluateRule(input: RuleEngineInput): EvaluateResult {
  return evaluateAnySale({
    watchId: input.watchId,
    rule: input.rule,
    snapshot: input.snapshot,
    prevState: input.prevState,
    nowIso: input.nowIso,
  });
}

export type { EvaluateResult, RuleState };
export type { SaleEvent } from "./anySale.js";

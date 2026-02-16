import { promises as fs } from "node:fs";
import path from "node:path";

export type SaleState = {
  onSale: boolean;
  updatedAt?: string; // optional, but nice
};

export type StateFile = Record<string, SaleState>;

const DEFAULT_STATE: StateFile = {};

export async function readState(statePath: string): Promise<StateFile> {
  try {
    const raw = await fs.readFile(statePath, "utf-8");
    const parsed = JSON.parse(raw) as StateFile;
    return parsed ?? DEFAULT_STATE;
  } catch (err: any) {
    if (err?.code === "ENOENT") return { ...DEFAULT_STATE };
    throw err;
  }
}

export async function writeState(
  statePath: string,
  state: StateFile,
): Promise<void> {
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  await fs.writeFile(statePath, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

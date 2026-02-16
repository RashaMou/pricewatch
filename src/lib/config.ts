import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WatchConfig } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.resolve(__dirname, "../../config");

function resolveConfigPath(filename: string) {
  return path.join(CONFIG_DIR, filename);
}

function readJsonFile<T>(filename: string): T {
  const fullPath = resolveConfigPath(filename);

  if (!existsSync(fullPath)) {
    throw new Error(`Config file not found: ${filename}`);
  }

  const raw = readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

export function writeJsonFile(filename: string, data: unknown) {
  const fullPath = resolveConfigPath(filename);
  writeFileSync(fullPath, JSON.stringify(data, null, 2));
}

export const loadWatches = () => readJsonFile<WatchConfig[]>("watches.json");

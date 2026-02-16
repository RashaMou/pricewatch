import { Command } from "commander";
import { listWatchesCommand } from "./list.js";

export function registerCommands(program: Command) {
  listWatchesCommand(program);
}

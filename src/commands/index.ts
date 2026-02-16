import { Command } from "commander";
import { listWatchesCommand } from "./list.js";
import { runCommand } from "./run.js";

export function registerCommands(program: Command) {
  listWatchesCommand(program);
  runCommand(program);
}

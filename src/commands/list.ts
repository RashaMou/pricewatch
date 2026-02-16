import { Command } from "commander";
import chalk from "chalk";
import { loadWatches } from "../lib/config.js";
import type { WatchRule } from "../types.js";

function formatRule(rule: WatchRule): string {
  if (rule.type === "belowPrice") return `${rule.type} (${rule.value})`;
  return rule.type; // anySale
}

function entriesForUnknownConfig(config: unknown): [string, unknown][] {
  if (config && typeof config === "object" && !Array.isArray(config)) {
    return Object.entries(config as Record<string, unknown>);
  }
  return [];
}

export function listWatchesCommand(program: Command) {
  program
    .command("list")
    .description("List all configured watches")
    .action(() => {
      const watches = loadWatches();

      if (!watches || watches.length === 0) {
        console.log(chalk.yellow("No watches configured."));
        return;
      }

      console.log(chalk.bold.cyan("\n📦  Watch List\n"));

      watches.forEach((watch, index) => {
        const number = chalk.gray(`${index + 1}.`);
        const id = chalk.bold.white(watch.id);
        const provider = chalk.green(watch.provider);

        console.log(`${number} ${id}`);
        console.log(`   ${chalk.dim("Provider:")} ${provider}`);

        for (const [key, value] of entriesForUnknownConfig(watch.config)) {
          console.log(
            `   ${chalk.dim(`${key}:`)} ${chalk.blue(String(value))}`,
          );
        }

        if (watch.rule) {
          console.log(
            `   ${chalk.dim("Rule:")} ${chalk.magenta(formatRule(watch.rule))}`,
          );
        }

        console.log();
      });
    });
}

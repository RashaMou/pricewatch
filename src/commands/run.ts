import { Command } from "commander";
import chalk from "chalk";
import { loadWatches } from "../lib/config.js";
import { providers } from "../providers/index.js";
import type { Snapshot } from "../types.js";
import { isOnSale } from "../rules/anySale.js";

function isProviderKey(x: string): x is keyof typeof providers {
  return x in providers;
}

export function runCommand(program: Command) {
  program
    .command("run")
    .description("Run price checks")
    .option("--id <id>", "Run a specific watch by id")
    .option("--debug", "Print request/response details on failures")
    .action(async (options) => {
      const watches = loadWatches();

      const selected = options.id
        ? watches.filter((w) => w.id === options.id)
        : watches;

      if (options.id && selected.length === 0) {
        console.log(chalk.red(`No watch found with id: ${options.id}`));
        return;
      }

      console.log(chalk.bold.cyan("\n🔍 Running price checks...\n"));

      for (const watch of selected) {
        if (!isProviderKey(watch.provider)) {
          console.log(chalk.red(`Unknown provider: ${watch.provider}\n`));
          continue;
        }

        const provider = providers[watch.provider];

        try {
          // Pass debug through config so providers can log on failure
          const typedConfig = provider.schema.parse({
            ...(watch.config as object),
            __debug: Boolean(options.debug),
          });

          const result: Snapshot = await provider.fetch(typedConfig);
          const onSale = isOnSale(result);

          console.log(chalk.bold.white(watch.id));
          console.log("   Provider:", chalk.green(watch.provider));
          console.log(
            "   On Sale:",
            onSale ? chalk.green("YES") : chalk.gray("no"),
          );

          if (result.currentPrice !== undefined) {
            const priceLine = onSale
              ? `${result.currentPrice} (${chalk.strikethrough(String(result.listPrice))})`
              : String(result.currentPrice);

            console.log(
              "   Price:",
              chalk.blue(priceLine),
              result.currency ?? "",
            );
          }

          console.log();
        } catch (err) {
          console.log(chalk.bold.white(watch.id));
          console.log(chalk.red(`   Failed: ${(err as Error).message}\n`));
        }
      }
    });
}

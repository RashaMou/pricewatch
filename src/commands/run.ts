import { Command } from "commander";
import chalk from "chalk";
import { loadWatches } from "../lib/config.js";
import { providers } from "../providers/index.js";
import type { Snapshot } from "../types.js";
import { isOnSale } from "../rules/anySale.js";
import { readState, writeState } from "../lib/state.js";

const STATE_PATH = "data/state.json";

// move to sepatate module later
type NotifyEvent =
  | { kind: "SALE_STARTED"; watchId: string; snapshot: Snapshot }
  | { kind: "SALE_ENDED"; watchId: string; snapshot: Snapshot };

async function notify(_event: NotifyEvent): Promise<void> {
  // stub
}

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

      const state = await readState(STATE_PATH);
      let dirty = false;

      console.log(chalk.bold.cyan("\n🔍 Running price checks...\n"));

      for (const watch of selected) {
        if (!isProviderKey(watch.provider)) {
          console.log(chalk.red(`Unknown provider: ${watch.provider}\n`));
          continue;
        }

        const provider = providers[watch.provider];

        try {
          const typedConfig = provider.schema.parse({
            ...(watch.config as object),
            __debug: Boolean(options.debug),
          });

          const result: Snapshot = await provider.fetch(typedConfig);
          const onSale = isOnSale(result);

          // update state only if missing or changed
          const prev = state[watch.id]?.onSale;
          if (prev === undefined || prev !== onSale) {
            state[watch.id] = { onSale, updatedAt: new Date().toISOString() };
            dirty = true;

            // transition events (notify later)
            if (prev === false && onSale === true) {
              await notify({
                kind: "SALE_STARTED",
                watchId: watch.id,
                snapshot: result,
              });
            } else if (prev === true && onSale === false) {
              await notify({
                kind: "SALE_ENDED",
                watchId: watch.id,
                snapshot: result,
              });
            }
          }

          console.log(chalk.bold.white(watch.id));
          console.log("   Provider:", chalk.green(watch.provider));
          console.log(
            "   On Sale:",
            onSale ? chalk.green("YES") : chalk.gray("no"),
          );

          const priceLine = onSale
            ? `${result.currentPrice} (${chalk.strikethrough(String(result.listPrice))})`
            : String(result.currentPrice);

          console.log(
            "   Price:",
            chalk.blue(priceLine),
            result.currency ?? "",
          );
          console.log();
        } catch (err) {
          console.log(chalk.bold.white(watch.id));
          console.log(chalk.red(`   Failed: ${(err as Error).message}\n`));
        }
      }

      if (dirty) {
        await writeState(STATE_PATH, state);
      }
    });
}

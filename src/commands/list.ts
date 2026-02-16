import { Command } from "commander";
import chalk from "chalk";
import { loadWatches } from "../lib/config.js";

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

        // Print provider-specific config fields (nicely)
        Object.entries(watch.config).forEach(([key, value]) => {
          console.log(
            `   ${chalk.dim(`${key}:`)} ${chalk.blue(String(value))}`,
          );
        });

        if (watch.rule) {
          const ruleText = watch.rule.value
            ? `${watch.rule.type} (${watch.rule.value})`
            : watch.rule.type;

          console.log(`   ${chalk.dim("Rule:")} ${chalk.magenta(ruleText)}`);
        }

        console.log();
      });
    });
}

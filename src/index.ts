import { Command } from "commander";
import { registerCommands } from "./commands/index.js";
import "dotenv/config";

const program = new Command();

program
  .name("pricewatch")
  .description("A CLI tool to track price drops")
  .version("1.0.0");

registerCommands(program);

program.parse();

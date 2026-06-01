#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ConfigManager, SemanticManager } from "@gobblecode/core";

const configManager = new ConfigManager();

yargs(hideBin(process.argv))
  .command(
    "index",
    "Build the semantic index for the current project",
    (yargs) => yargs,
    async () => {
      const config = await configManager.load();
      if (!config.semantic) {
        console.error("Run 'gobblecode setup' first to configure semantic search.");
        process.exit(1);
      }

      const projectRoot = process.cwd();
      const manager = new SemanticManager(config.semantic, projectRoot);

      console.log("Building semantic index...");
      const index = await manager.buildIndex((msg: string) => console.log(msg));
      console.log(
        `\nDone! Indexed ${index.stats.totalChunks} chunks from ${index.stats.totalFiles} files.`
      );
    }
  )
  .command(
    "query <text>",
    "Search the semantic index",
    (yargs) =>
      yargs.positional("text", {
        describe: "Search query",
        type: "string",
        demandOption: true,
      }),
    async (argv) => {
      const config = await configManager.load();
      if (!config.semantic) {
        console.error("Run 'gobblecode setup' first to configure semantic search.");
        process.exit(1);
      }

      const projectRoot = process.cwd();
      const manager = new SemanticManager(config.semantic, projectRoot);

      console.log(`Searching for: "${argv.text}"\n`);
      const results = await manager.query(argv.text, 5);

      if (results.length === 0) {
        console.log("No results found.");
        return;
      }

      for (const result of results) {
        console.log(
          `[${(result.score * 100).toFixed(1)}%] ${result.chunk.filePath}:${result.chunk.startLine}-${result.chunk.endLine}`
        );
        const preview = result.chunk.content.slice(0, 200).replace(/\n/g, " ");
        console.log(`  ${preview}...\n`);
      }
    }
  )
  .command(
    "$0",
    "Launch the GobbleCode TUI",
    () => {},
    async () => {
      const { render } = await import("ink");
      const { App } = await import("./App.js");
      render(<App />);
    }
  )
  .help()
  .parse();

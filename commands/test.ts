import * as Vorpal from "vorpal";

/**
 * Shows a debug message
 */
async function action() {
  this.log(`test: successful`);
}

/**
 * Exports contents of file to be usable by main.ts
 */
export const test = (vorpal: Vorpal) => vorpal
  .command("test", `Outputs a debug message`)
  .action(action);

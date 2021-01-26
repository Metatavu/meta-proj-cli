import Vorpal from "vorpal";
import { pullProj } from "./pull-proj";

const vorpal = new Vorpal();

/**
 * Prompts the user and runs corresponding commands
 */
async function action() {
  await vorpal
    .use(pullProj)
    .execSync("pull-proj");
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const continueProj = (vorpal : Vorpal) => vorpal
  .command("continue-proj", `Continue setting up an existing project`)
  .action(action);

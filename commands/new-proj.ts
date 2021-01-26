import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
import { test } from "./test";
import { CommandSet } from "../interfaces/command-set";

const vorpal = new Vorpal();
const testOrder : CommandSet[] = [{use : newRepo, command : "new-repo"}, {use : test, command : "test"}];

/**
 * Prompts the user and runs corresponding commands
 */
async function action() {

  const commandOrder = testOrder;

  for(const command of commandOrder) {
    try {
      await vorpal
        .use(command.use)
        .execSync(command.command);
    } catch (err) {
      throw this.log(`Encountered an error while executing command: ${command.command}. The error: ${err}`)
    }
  };
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const newProj = (vorpal : Vorpal) => vorpal
  .command("new-proj", `Start a new project`)
  .action(action);

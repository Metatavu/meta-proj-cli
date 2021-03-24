import Vorpal from "vorpal";
import OsUtils from "../classes/os-utils";
import { PromptUtils } from "../classes/prompt-utils";

/**
 * Prompts the user to input their OS for running other commands later on
 */
async function action() {
  try {
    const osResult = await PromptUtils.listPrompt(this, "Which operating system are you using? ", [ "LINUX", "WINDOWS", "MAC OS" ]);

    if (osResult) {
      OsUtils.setOS(osResult);
    } else {
      throw new Error("ERROR: No operating system has been input.");
    }
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const selectOs = (vorpal: Vorpal): Vorpal.Command => vorpal
  .command("select-os", `Select OS`)
  .action(action);

import Vorpal from "vorpal";
import OsUtils from "../classes/os-utils";

const vorpal = new Vorpal();

/**
 * Prompts the user to input their OS for running other commands later on
 */
async function action() {
  try {
    const nameResult = await this.prompt({
      type : "list",
      name : "os",
      choices : ["LINUX", "WINDOWS", "MAC OS"],
      message : "Which operating system are you using? "
    });

    if (nameResult.os) {
      OsUtils.setOS(nameResult.os);
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
export const selectOs = (vorpal : Vorpal) => vorpal
  .command("select-os", `Select OS`)
  .action(action);

import Vorpal from "vorpal";
import { CheckUtils } from "../classes/check-utils";
import { CheckSet } from "../interfaces/types";

/**
 * Shows a debug message
 */
async function action() {
  let test : CheckSet[] = [{checkable : "git", details : {}}]

  this.log(await CheckUtils.checkPreq(test));

  this.log(`test: successful`);
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const test = (vorpal : Vorpal) => vorpal
  .command("test", `Outputs a debug message`)
  .action(action);

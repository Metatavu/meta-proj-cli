import Vorpal from "vorpal";
import { CheckUtils } from "../classes/check-utils";
import { CheckSet } from "../interfaces/check-set";

/**
 * Shows a debug message
 */
async function action() {
  let testi : CheckSet[] = [{checkable : "git", details : {}}]

  console.log(await CheckUtils.checkPreq(testi));

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

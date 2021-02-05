import { execSync } from "child_process";
import { CheckErrorSet } from "../../interfaces/types";

/**
 * Checks if git is installed on the device
 * 
 * @param details should contain an empty object
 * 
 * @returns {CheckErrorSet} ChekErrorSet.
 */
export const checkGit = async (details: Object) => {

  let returnSet : CheckErrorSet = {check : "git", error : false, details : ""};

  try {
    if (!execSync("git --version").toString().match(/^(git version)/)) {
      returnSet.error = true;
      returnSet.details = "Git not installed";
    }
  } catch (err) {
    returnSet.error = true;
    returnSet.details = `Error while checking git ${err}`;
  }
  return returnSet;
}

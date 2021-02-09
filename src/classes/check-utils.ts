import { CheckSet, CheckErrorSet  } from "../interfaces/types";
import { checkGit } from "../functions/checks/checkGit";

/**
 * Class for check utility functions
 */
export class CheckUtils {

  /**
   * Runs given checks and returns their results
   * 
   * @param toCheck contains a CheckSet array with prerequisites to check
   */
  static checkPreq = async (toCheck : CheckSet[]) : Promise<CheckErrorSet[]> => {
    const erroList : CheckErrorSet[] = [];

    for (const currentCheck of toCheck) {
      try {
        const checkResult : CheckErrorSet = await checkRouter(currentCheck);
      
        if(checkResult.error){
          erroList.push(checkResult);
        } 
      } catch (err) {
        throw new Error(`Encountered error while checking prerequisite "${currentCheck.checkable}". \nError: ${err}`);
      }
    }
    return erroList;
  }
}

/**
 * Routes details to relevant check functions
 * 
 * @param currentCheck details of current checkable command
 */
const checkRouter = async (currentCheck : CheckSet) => {
  try {
    switch(currentCheck.checkable){
      case "git":
        return await checkGit();
    }
  } catch (err) {
    throw new Error(`Encountered error while checking prerequisite "${currentCheck.checkable}". \nError: ${err}`);
  }
}

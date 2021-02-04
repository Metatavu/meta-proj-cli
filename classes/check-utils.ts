import { CheckSet } from "../interfaces/check-set";
import { CheckErrorSet } from "../interfaces/check-error-set";
import { checkGit } from "../functions/checks/checkGit";

/**
 * runs relevant check functions for given prerequisites
 * 
 * @param toCheck contains a CheckSet array with prerequisites to check
 */
export class CheckUtils {
  static checkPreq = async (toCheck : CheckSet[]) => {
    let erroList : CheckErrorSet[] = [];

    for (let currentCheck of toCheck) {
      try {
        let checkResult : CheckErrorSet = await checkRouter(currentCheck);
      
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

const checkRouter = async (currentCheck : CheckSet) => {
  try{
    switch(currentCheck.checkable){
      case "git":
        return await checkGit(currentCheck.details);
    }
  } catch (err) {
    throw new Error(`Encountered error while checking prerequisite "${currentCheck.checkable}". \nError: ${err}`);
  }
}
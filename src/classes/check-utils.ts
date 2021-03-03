import { CheckSet, CheckErrorSet  } from "../interfaces/types";
import { InstallUtils } from "./install-utils";

/**
 * Class for check utility functions
 */
export class CheckUtils {

  /**
   * Runs given checks and returns their results
   * 
   * @param toCheck contains a CheckSet array with prerequisites to check
   */
  static checkPreq = async (toCheck: CheckSet[]): Promise<CheckErrorSet[]> => {
    const erroList: CheckErrorSet[] = [];

    for (const currentCheck of toCheck) {
      try {
        const checkResult: CheckErrorSet = await checkHandler(currentCheck);
      
        if(checkResult.error){
          erroList.push(checkResult);
        } 
      } catch (err) {
        return Promise.reject(`Encountered error while checking prerequisite "${currentCheck.checkable}". \nError: ${err}`)
      }
    }
    return erroList;
  }
}

/**
 * Handles runned checks one at a time
 * 
 * @param {CheckSet} currentCheck  details of current checkable command
 * @returns {CheckErrorSet} that contains software name, error and possible details
 */
const checkHandler = async (currentCheck: CheckSet): Promise<CheckErrorSet> => {
  try {
    const installed: boolean = await InstallUtils.isInstalled(currentCheck.checkable);

    return {
      check: currentCheck.checkable,
      error: installed ? false : true,
      details: installed ? null : `${currentCheck.checkable} not installed!`
    };

  } catch (err) {
    throw new Error(`Encountered error while checking prerequisite "${currentCheck.checkable}". \nError: ${err}`);
  }
}
import { CheckSet, CheckErrorSet, Software  } from "../interfaces/types";
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
  static checkPreq = async (toCheck: CheckSet[]): Promise<CheckErrorSet[]> => {
    const erroList: CheckErrorSet[] = [];

    for (const currentCheck of toCheck) {
      try {
        const checkResult: CheckErrorSet = await checkRouter(currentCheck);
      
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
const checkRouter = async (currentCheck: CheckSet) => {
  try {
    switch(currentCheck.checkable){
      case Software.NodeJs:
        //To do: add check
        console.log(`Should add check for ${Software.NodeJs}`);
        return await checkGit();

      case Software.GitHub:
        //To do: add check
        console.log(`Should add check for ${Software.GitHub}`);
        return await checkGit();

      case Software.GitCLI:
        return await checkGit();

      case Software.Maven:
        //To do: add check
        console.log(`Should add check for ${Software.Maven}`);
        return await checkGit();

      case Software.JDK8:
        //To do: add check
        console.log(`Should add check for ${Software.JDK8}`);
        return await checkGit();
        
      case Software.JDK11:
        //To do: add check
        console.log(`Should add check for ${Software.JDK11}`);
        return await checkGit();

      case Software.Homebrew:
        //To do: add check
        console.log(`Should add check for ${Software.Homebrew}`);
        return await checkGit();

      case Software.Docker:
        //To do: add check
        console.log(`Should add check for ${Software.Docker}`);
        return await checkGit();

      case Software.Minikube:
        //To do: add check
        console.log(`Should add check for ${Software.Minikube}`);
        return await checkGit();

      case Software.KubernetesCLI:
        //To do: add check
        console.log(`Should add check for ${Software.KubernetesCLI}`);
        return await checkGit();

      case Software.Kustomize:
        //To do: add check
        console.log(`Should add check for ${Software.Kustomize}`);
        return await checkGit();
    }
  } catch (err) {
    throw new Error(`Encountered error while checking prerequisite "${currentCheck.checkable}". \nError: ${err}`);
  }
}

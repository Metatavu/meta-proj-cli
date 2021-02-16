import OsUtils from "../../classes/os-utils";
import { CommandNames } from "../../interfaces/types";

/**
 * Constructs creation command for default projects
 * 
 * @param projName desired project name
 * 
 * @param folderPath outer folder
 * 
 * @param repoPath inner folder, for GitHub etc
 * 
 * @returns an array of strings which includes the commands to be run on the new-proj thread
 */
export const CreateDefault = async (projName : string, folderPath : string, repoPath : string) : Promise<string[]> => {
  const copy = await OsUtils.getCommand(CommandNames.copy);
  const cmdsArray : string[] = [];
  cmdsArray.push(`mkdir ${projName}`);
  cmdsArray.push(`${copy} project-config.json ${folderPath}`);
  cmdsArray.push(`${copy} README.md ${repoPath}`);

  return cmdsArray;
}
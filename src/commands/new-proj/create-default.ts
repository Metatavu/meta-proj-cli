import OsUtils from "../../classes/os-utils";
import { CommandNames } from "../../interfaces/types";

export const CreateDefault = async (projName : string, folderPath : string, repoPath : string) : Promise<string[]> => {
  const copy = await OsUtils.getCommand(CommandNames.copy);
  const cmdsArray : string[] = [];
  cmdsArray.push(`mkdir ${projName}`);
  cmdsArray.push(`${copy} project-config.json ${folderPath}`);
  cmdsArray.push(`${copy} README.md ${repoPath}`);
  
  return cmdsArray;
}
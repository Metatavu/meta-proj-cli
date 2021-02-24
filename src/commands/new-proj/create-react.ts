import OsUtils from "../../classes/os-utils";
import { CommandNames } from "../../interfaces/types";
/**
 * Create React project
 * 
 * @param projName desired project name
 * @returns a creation command to be run on the new-proj thread
 */
export const CreateReact = async (projName: string): Promise<string> => {
  return `npx create-react-app ${projName} --template typescript`;
}


/**
 * Clean unnecessary files from React project folder
 * 
 * @param folderPath outer folder
 * @param repoPath inner folder, for GitHub etc
 * @returns an array of strings which includes the commands to be run on the new-proj thread
 */
export const CleanReact = async (folderPath: string, repoPath: string): Promise<string[]> => {
  let remove : string = null;
  let copy : string = null;
  try {
    remove = await OsUtils.getCommand(CommandNames.remove);
    copy = await OsUtils.getCommand(CommandNames.copy);
  } catch (err) {
    throw new Error(`Error when fetching command: ${err}`);
  }
  const cmdsArray : string[] = [];
  cmdsArray.push(`${remove} README.md`);
  cmdsArray.push(`${remove} src/App.css`);
  cmdsArray.push(`${remove} src/App.test.tsx`);
  cmdsArray.push(`${remove} src/App.tsx`);
  cmdsArray.push(`${remove} src/index.css`);
  cmdsArray.push(`${remove} src/index.tsx`);
  cmdsArray.push(`${remove} src/logo.svg`);
  cmdsArray.push(`${remove} src/react-app-env.d.ts`);
  cmdsArray.push(`${remove} src/setupTests.ts`);
  cmdsArray.push(`${copy} project-config.json ${folderPath}`);
  cmdsArray.push(`${copy} README.md ${repoPath}`);

  return cmdsArray;
}

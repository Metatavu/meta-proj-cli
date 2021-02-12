import { execSync } from "child_process";
import * as path from "path";
import OsUtils from "../../classes/os-utils";

/**
 * Cleans unused files from a react project
 * 
 * @param repoPath path where the cleanable react resides
 */

 export const ReactCleanup = async (repoPath : string) : Promise<void> => {

  const srcPath : string = repoPath + path.sep + "src";

  try {
    const remove = await OsUtils.getCommand("remove");

    execSync(`${remove} App.css`, {cwd : srcPath});
    execSync(`${remove} App.test.tsx`, {cwd : srcPath});
    execSync(`${remove} App.tsx`, {cwd : srcPath});
    execSync(`${remove} index.css`, {cwd : srcPath});
    execSync(`${remove} index.tsx`, {cwd : srcPath});
    execSync(`${remove} logo.svg`, {cwd : srcPath});
    execSync(`${remove} react-app-env.d.ts`, {cwd : srcPath});
    execSync(`${remove} setupTests.ts`, {cwd : srcPath});
  } catch(err) {
    throw new Error(`Error while cleaning react: ` + err);
  }

};
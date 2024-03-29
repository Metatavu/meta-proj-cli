import Vorpal from "vorpal";
import * as path from "path";
import * as fs from "fs";
import { PathUtils } from "../classes/path-utils";
import OsUtils from "../classes/os-utils";
import { runExecSync } from "../classes/exec-sync-utils";
import { PromptUtils } from "../classes/prompt-utils";

const { HOME } = process.env;
const defaultPath = `${HOME}/.meta-proj-cli/projects`;

/**
 * Prompts the user and pulls given repo to local
 */
async function action() {
  let repoName: string = null;
  let repoPath: string = null;
  let repoIsLocal = false;
  let givenPath: string = null;
  const copy: string = await OsUtils.getCommand("copy");

  try { 
    const repoNameResult = await PromptUtils.inputPrompt(this, "Give the name of the repository: ")

    if (repoNameResult) {
      repoName = repoNameResult;
    } else {
      throw new Error("No repository name given");
    }
  } catch (err) {
    throw new Error(`Error while prompting repository name: ${err}`);
  }

  try {
    await runExecSync(`gh repo view ${process.env.GIT_ORGANIZATION}/${repoName}`, { stdio: "ignore" });
  } catch (err) {
    throw new Error(`Error while searching for repository: ${err}`);
  }

  try { 
    repoIsLocal = await PromptUtils.confirmPrompt(this, "Is the repository installed locally? ");

  } catch (err) {
    throw new Error(`Encountered error while prompting repository locality: ${err}`);
  }

  try { 
    const repoPathResult = await PromptUtils.inputPrompt(this, 
      repoIsLocal ?
        "Give a directory where to search for the repository (leave empty for default): " :
        "Give a directory where to open the repository folder (leave empty for default): "
    );

    repoPathResult !== "" ? 
      givenPath = await PathUtils.fixPath(repoPathResult):
      givenPath = await PathUtils.fixPath(defaultPath);

  } catch (err) {
    throw new Error(`Encountered error while prompting repository path: ${err}`);
  }

  if (repoIsLocal) {
    try {
      const searchPath: string = PathUtils.repoFolder(givenPath, repoName);
      if (fs.existsSync(path.join(searchPath, ".git"))) {
        repoPath = searchPath;
      } else {
        throw new Error("Inappropriate folder (wrong path or doesn't house project)");
      }
    } catch (err) {
      throw new Error(`Encountered error while searching for folder: ${err}`);
    }
  } else {
    const folderPath: string = PathUtils.outerFolder(givenPath, repoName);
    repoPath = PathUtils.repoFolder(givenPath, repoName);

    await runExecSync(`mkdir ${folderPath}`);
    await runExecSync(`mkdir ${repoPath}`);
    await runExecSync("git init", { cwd: repoPath });

    await runExecSync(`${copy} project-config.json ${folderPath}`, { cwd: `.${path.sep}resources` });

    await runExecSync(
      `git remote add origin git@github.com:${process.env.GIT_ORGANIZATION}/${repoName}.git`, { cwd: repoPath }
    );
  }

  await runExecSync(`git pull -q git@github.com:${process.env.GIT_ORGANIZATION}/${repoName}.git`, { cwd: repoPath });
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const pullProj = (vorpal: Vorpal): Vorpal.Command => vorpal
  .command("pull-proj", `Pulls a project to an existing local repository or creates a new one`)
  .action(action);

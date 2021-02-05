import Vorpal from "vorpal";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { PathUtils } from "../classes/path-utils";

const vorpal = new Vorpal();

const { HOME } = process.env;
const defaultPath : string = `${HOME}/.meta-proj-cli/projects`;

/**
 * Prompts the user and pulls given repo to local
 */
async function action() {
  let repoName : string = null;
  let repoPath : string = null;
  let repoIsLocal : boolean = false;
  let givenPath : string = null;

  try { 
    const repoNameResult = await this.prompt({
      type : 'input',
      name : 'name',
      message : "Give the name of the repository: "
    });

    if (repoNameResult.name) {
      repoName = repoNameResult.name;
    } else {
      throw new Error("No repository name given");
    }
  } catch (err) {
    throw new Error(`Error while prompting repository name: ${err}`);
  }

  try {
    execSync(`gh repo view ${process.env.GIT_ORGANIZATION}/${repoName}`, {stdio : "ignore"});
  } catch (err) {
    throw new Error(`Error while searching for repository: ${err}`);
  }

  try { 
    const repoIsLocalResult = await this.prompt({
      type : 'confirm',
      name : 'isLocal',
      message : "Is the repository installed locally? "
    });

    repoIsLocal = repoIsLocalResult.isLocal;

  } catch (err) {
    throw new Error(`Encountered error while prompting repository locality: ${err}`);
  }

  try { 
    const repoPathResult = await this.prompt({
      type : 'input',
      name : 'path',
      message : repoIsLocal ?
        "Give a directory where to search for the repository (leave empty for default): " :
        "Give a directory where to open the repository folder (leave empty for default): "
    });

    repoPathResult.path !== "" ? 
      givenPath = PathUtils.fixPath(repoPathResult.path):
      givenPath = PathUtils.fixPath(defaultPath);

  } catch (err) {
    throw new Error(`Encountered error while prompting repository path: ${err}`);
  }

  if (repoIsLocal) {
    try {
      const searchPath : string = PathUtils.repoFolder(givenPath, repoName);
      if (fs.existsSync(path.join(searchPath, ".git"))) {
        repoPath = searchPath;
      } else {
        throw new Error("Inappropriate folder (wrong path or doesn't house git)");
      }
    } catch (err) {
      throw new Error(`Encountered error while searching for folder: ${err}`);
    }
  } else {
    const folderPath : string = PathUtils.outerFolder(givenPath, repoName);
    repoPath = PathUtils.repoFolder(givenPath, repoName);

    execSync(`mkdir ${folderPath}`);
    execSync(`mkdir ${repoPath}`);
    execSync("git init", {cwd : repoPath});
    execSync(`cp project-config.json ${folderPath}`, {cwd : `.${path.sep}resources`})
    execSync(
      `git remote add origin git@github.com:${process.env.GIT_ORGANIZATION}/${repoName}.git`,
      {cwd : repoPath}
    );
  }

  execSync(`git pull -q git@github.com:${process.env.GIT_ORGANIZATION}/${repoName}.git`, {cwd : repoPath});
}

/**
 * Exports contents of file to be usable by others files
 * 
 * @param vorpal vorpal instance
 */
export const pullProj = (vorpal : Vorpal) => vorpal
  .command("pull-proj", `Pulls a project to an existing local repository or creates a new one`)
  .action(action);

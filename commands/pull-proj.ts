import Vorpal from "vorpal";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { fixPath } from "../functions/fixPath";

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

    if (repoNameResult.name !== "") {
      repoName = repoNameResult.name;
    } else {
      throw this.log("No repository name given");
    }
  } catch (err) {
    throw this.log(`Error while prompting repository name: ${err}`);
  }

  try {
    execSync(`gh repo view ${repoName}`, {stdio : "ignore"});
  } catch (err) {
    throw this.log(`Error while searching for repository: ${err}`);
  }

  try { 
    const repoIsLocalResult = await this.prompt({
      type : 'confirm',
      name : 'isLocal',
      message : "Is the repository installed locally? "
    });

    repoIsLocal = repoIsLocalResult.isLocal;

  } catch (err) {
    throw this.log(`Encountered error while prompting repository locality: ${err}`);
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
      givenPath = fixPath(repoPathResult.path):
      givenPath = fixPath(defaultPath);

  } catch (err) {
    throw this.log(`Encountered error while prompting repository path: ${err}`);
  }

  if (repoIsLocal) {
    try {
      const searchPath : string = givenPath + path.sep + repoName + path.sep + repoName + "-git";
      if (fs.existsSync(searchPath + path.sep + ".git")) {
        repoPath = searchPath;
      } else {
        throw this.log("Inappropriate folder (wrong path or doesn't house git)");
      }
    } catch (err) {
      throw this.log(`Encountered error while searching for folder: ${err}`);
    }
  } else {
    const folderPath : string = path.join(givenPath, repoName);
    repoPath = path.join(folderPath , repoName + "-git");

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
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const pullProj = (vorpal : Vorpal) => vorpal
  .command("pull-proj", `Pulls a project to an existing local repository or creates a new one`)
  .action(action);

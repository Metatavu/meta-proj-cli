import { execSync } from "child_process";
import Vorpal from "vorpal";
import { PathUtils } from "../classes/path-utils";
import { ReactCleanup } from "./command-functions/clean-react";

const { HOME } = process.env;
const defaultPath = `${HOME}/.meta-proj-cli/projects`;

/**
 * Adds react to the project
 * 
 * @param args contains path and reponame\
 * path : path where project resides\
 * repoName : name of the repository\
 */
async function action(args) {
  const givenRepoName : string = args.repoName;
  let template = null;

  const givenPath : string = args.path ? 
    await PathUtils.fixPath(args.path) :
    defaultPath;

  const repoPath = PathUtils.repoFolder(givenPath, givenRepoName);

  try { 
    const templateResult = await this.prompt({
      type : 'list',
      name : 'template',
      choices : ["typescript", "yes", "no"],
      message : "Do you want to use a template?"
    });

    if (templateResult.template === "yes") {
      const templateInputResult = await this.prompt({
        type : 'input',
        name : 'template',
        message : "Give the name of the template you wish to use: "
      });

      template = templateInputResult.template;
    }
    else if(templateResult.template === "typescript") {
      template = "typescript"
    }

  } catch(err) {
    throw new Error(`Encountered error while prompting react template ${err}`);
  }

  try {
    execSync(
      `npx create-react-app . ${template ? "--template" + template : ""}`,
      {cwd : repoPath, stdio : "ignore"}
    );
  } catch(err) {
    throw new Error(`Encountered error when adding react: ${err}`);
  }

  await ReactCleanup(repoPath);

}

/**
 * Exports contents of file to be usable by other files
 * 
 * @param vorpal vorpal instance
 */
export const addReact = (vorpal : Vorpal) : Vorpal.Command => vorpal
  .command(
    "add-react <repoName> [path]",
    `Adds react to your project. <repoName> name of the repository. <path>: path where the project resides (leave empty for default).`
  )
  .action(action);

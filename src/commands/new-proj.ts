import Vorpal from "vorpal";
import { newRepo } from "./new-proj/new-repo";
import { test } from "./checkTest";
import { PathUtils } from "../classes/path-utils";
import { CreateDefault } from "./new-proj/create-default";
import * as path from "path";
import { execSync } from "child_process";

const vorpal = new Vorpal();
const { HOME } = process.env;
let givenPath = `${HOME}/.meta-proj-cli/projects`;

/**
 * Prompts the user and runs corresponding commands
 */
async function action() {
  let projName : string = null;
  let projType : string = null;
  let gh = false;

  try {
    const nameResult = await this.prompt({
      type : "input",
      name : "name",
      message : "Give a name for the project: "
    });

    if (nameResult.name) {
      projName= nameResult.name;
    } else {
      throw new Error("No name was given for the project");
    }

    const typeResult = await this.prompt({
      type : 'list',
      name : 'type',
      choices : ["Quarkus", "React", "No framework"],
      message : "Framework for the project: "
    });

    if (typeResult.name) {
      projType= typeResult.name;
    } else {
      throw new Error("No type was given for the project");
    }

    const pathResult = await this.prompt({
      type : 'input',
      name : 'path',
      message : "Set a path where to initiate repository, leave empty for default: "
    });

    if (pathResult?.path) {
      givenPath = pathResult.path;
    }
  } catch (err) {
    throw new Error("Error: " + err);
  }

  givenPath = await PathUtils.fixPath(givenPath);
  const folderPath : string = PathUtils.outerFolder(givenPath, projName);
  const repoPath : string = PathUtils.repoFolder(givenPath, projName);

  if (projType == "Quarkus") {
    //TODO: Add quarkus
    this.log("Creating Quarkus project - please wait...");
  }

  if (projType == "React") {
    //TODO: Add React
    this.log("Creating react project - please wait...");
  }

  if (projType == "No framework") {
    this.log("Creating project - please wait...");
    const cmds : string[] = await CreateDefault(projName, folderPath, repoPath);
    execSync(cmds[0]);
    execSync(cmds[1], {cwd : `.${path.sep}resources`});
    execSync(cmds[2], {cwd : `.${path.sep}resources`});
  }

  try {
    const repoResult = await this.prompt({
      type : 'list',
      name : 'repo',
      choices : ["Yes", "No"],
      message : "Create GitHub repository for the project?: "
    });

    if (repoResult.name) {
      if (repoResult.name == "Yes") {
        gh = true;
      }
    } else {
      throw new Error("Needed information on GitHub wasn't provided.");
    }
  } catch (err) {
    throw new Error("Error: " + err);
  }

  if(gh){
    try {
      await vorpal
      .use(newRepo)
      .execSync(`new-repo ${projName} --path ${givenPath}`);
    } catch(err) {
      throw new Error("Encountered an error while creating repository: " + err);
    }
  }
  
  try {
    const testResult = await this.prompt({
      type : "confirm",
      name : "testAnswer",
      message : `do you want to run a test for ${projName}`
    });

    if (testResult.testAnswer) {
      await vorpal
      .use(test)
      .execSync("test");
    }
  } catch(err) {
    throw new Error(err);
  }
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const newProj = (vorpal : Vorpal) : Vorpal.Command => vorpal
  .command("new-proj", `Start a new project`)
  .action(action);

import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
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
  let projVm : string = null;
  let folderPath : string = null;
  let repoPath : string = null;

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

    if (typeResult.type) {
      projType = typeResult.type;
    } else {
      throw new Error("No type was given for the project");
    }

    const vmResult = await this.prompt({
      type : 'list',
      name : 'vm',
      choices : ["None", "Docker", "Minikube"],
      message : "Add virtual environment for the project: "
    });

    if (typeResult.vm) {
      projVm = typeResult.vm;

    } else {
      throw new Error("No environment option was given for the project");
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
    throw new Error(`Error while prompting: ${err}`);
  }

  try {
    givenPath = await PathUtils.fixPath(givenPath);
    folderPath = PathUtils.outerFolder(givenPath, projName);
    repoPath = PathUtils.repoFolder(givenPath, projName);

  } catch (err) {
    throw new Error(`Error when attempting to resolve paths: ${err}`);
  }
  

  if (projType == "Quarkus") {
    //To do: Add quarkus
    this.log("Creating Quarkus project - please wait...");
  }

  if (projType == "React") {
    //To do: Add React
    this.log("Creating react project - please wait...");
  }

  if (projType == "No framework") {
    this.log("Creating project - please wait...");
    try {
      const cmds : string[] = await CreateDefault(projName, folderPath, repoPath);
      execSync(cmds[0]);
      execSync(cmds[1], {cwd : `.${path.sep}resources`});
      execSync(cmds[2], {cwd : `.${path.sep}resources`});

    } catch(err) {
      throw new Error(`Error when creating project : ${err}`);
    }
    
  }

  if (projVm != "None") {
    if (projVm == "Docker") execSync(`docker build -t ${projName} ${repoPath}`);
    if (projVm == "Minikube") {
      try {
        // Add yaml files and crate resources in another issue
      } catch (err) {
        throw new Error(`Error when attempting to init project into Minicube: ${err}`);
      }
    } 
  }

  try {
    await vorpal
    .use(newRepo)
    .execSync(`new-repo ${projName} --path ${givenPath}`);

  } catch(err) {
    throw new Error("Encountered an error while creating repository: " + err);
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
    throw new Error(`Error while performing tests: ${err}`);
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

import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
import { test } from "./checkTest";
import { PathUtils } from "../classes/path-utils";
import { CreateDefault } from "./new-proj/create-default";
import * as path from "path";
import { runExecSync } from "../classes/exec-sync-utils";
import { CreateQuarkus } from "./new-proj/create-quarkus";
import { CleanReact, CreateReact } from "./new-proj/create-react";

const vorpal = new Vorpal();
const { HOME } = process.env;
let givenPath = `${HOME}/.meta-proj-cli/projects`;
let projName: string = null;
let projType: string = null;
let projVm: string = null;
let folderPath: string = null;
let repoPath: string = null;
let kotlin = true;
let gradle = true;

/**
 * Prompts the user and runs corresponding commands
 */
async function action() {

  try {
    const nameResult = await this.prompt({
      type: "input",
      name: "name",
      message: "Give a name for the project: "
    });

    if (nameResult.name) {
      projName = nameResult.name;
    } else {
      throw new Error("No name was given for the project");
    }

    const typeResult = await this.prompt({
      type: "list",
      name: "type",
      choices: [ "Quarkus", "React", "No framework" ],
      message: "Framework for the project: "
    });

    if (typeResult.type) {
      projType = typeResult.type;
    } else {
      throw new Error("No type was given for the project");
    }

    const vmResult = await this.prompt({
      type: "list",
      name: "vm",
      choices: [ "None", "Docker", "Minikube" ],
      message: "Add virtual environment for the project: "
    });

    if (vmResult.vm) {
      projVm = vmResult.vm;

    } else {
      throw new Error("No environment option was given for the project");
    }

    const pathResult = await this.prompt({
      type: "input",
      name: "path",
      message: "Set a path where to initiate repository, leave empty for default: "
    });

    if (pathResult?.path) {
      givenPath = pathResult.path;
    }
  } catch (err) {
    throw new Error(`Error while prompting: ${err}`);
  }

  resolvePaths();
  
  if (projType == "Quarkus") {
    this.log("Creating Quarkus project - please wait...");
    try {
      const kotlinResult = await this.prompt({
        type: "list",
        name: "kotlin",
        choices: [ "Yes", "No" ],
        message: "Use Kotlin?: "
      });

      const gradleResult = await this.prompt({
        type: "list",
        name: "gradle",
        choices: [ "Yes", "No" ],
        message: "Use Gradle?: "
      });

      if (!kotlinResult.kotlin || !gradleResult.gradle) {
        kotlin = false;
        gradle = false;
      } else {
        (kotlinResult.kotlin == "Yes") ? kotlin = true : kotlin = false;
        (gradleResult.gradle == "Yes") ? gradle = true : gradle = false;
      }
      initQuarkusProject();

    } catch (err) {
      throw new Error(`Error when attempting to init ${projType} project: ${err}`);
    }
    
  }

  if (projType == "React") {
    this.log("Creating react project - please wait...");
    initReactProject();
  }

  if (projType == "No framework") {
    this.log("Creating project - please wait...");
    initDefaultProject();
  }

  if (projVm != "None") {
    if (projVm == "Docker") runExecSync(`docker build -t ${projName} ${repoPath}`);
    if (projVm == "Minikube") {
      try {
        // Add yaml files and crate resources in another issue
      } catch (err) {
        throw new Error(`Error when attempting to init project into Minicube: ${err}`);
      }
    } 
  }

  repoViaVorpal();

  try {
    const testResult = await this.prompt({
      type: "confirm",
      name: "testAnswer",
      message: `Do you want to run a test for ${projName}?`
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
 * Gets OS-spevific version of path and resolves it into the outer and inner folder
 */
async function resolvePaths() {
  try {
    givenPath = await PathUtils.fixPath(givenPath);
    folderPath = PathUtils.outerFolder(givenPath, projName);
    repoPath = PathUtils.repoFolder(givenPath, projName);

  } catch (err) {
    throw new Error(`Error when attempting to resolve paths: ${err}`);
  }
}

/**
 * Inits a default project with no framework attached
 */
async function initDefaultProject() {
  try {
    const cmds: string[] = await CreateDefault(projName, folderPath, repoPath);
    await runExecSync(cmds[0]);
    await runExecSync(cmds[1], { cwd: `.${path.sep}resources` });
    await runExecSync(cmds[2], { cwd: `.${path.sep}resources` });

  } catch(err) {
    throw new Error(`Error when creating project: ${err}`);
  }
}

/**
 * Inits a React project
 */
async function initReactProject() {
  try {
    const cmd: string = await CreateReact(projName);
    await runExecSync(cmd);

    const cmds: string[] = await CleanReact(folderPath, repoPath);
    for (let i = 0; i < cmds.length; i++) {
      (i <= 8) ? await runExecSync(cmds[i]) : await runExecSync(cmds[i], { cwd: `.${path.sep}resources` });
    }

  } catch(err) {
    throw new Error(`Error when creating project: ${err}`);
  }
}

/**
 * Inits a Quarkus project
 */
async function initQuarkusProject() {
  try {
    const cmd: string = await CreateQuarkus(projName, kotlin, gradle);
    await runExecSync(cmd);

  } catch(err) {
    throw new Error(`Error when creating project: ${err}`);
  }
}

/**
 * Runs command new-repo with user given parameters
 */
async function repoViaVorpal() {
  try {
    await vorpal
    .use(newRepo)
    .execSync(`new-repo ${projName} --path ${givenPath}`);

  } catch(err) {
    throw new Error("Encountered an error while creating repository: " + err);
  }
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const newProj = (vorpal: Vorpal): Vorpal.Command => vorpal
  .command("new-proj", `Start a new project`)
  .action(action);

import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
import { test } from "./checkTest";
import { PathUtils } from "../classes/path-utils";
import { CreateDefault } from "./new-proj/create-default";
import * as path from "path";
import { runExecSync } from "../classes/exec-sync-utils";
import { CreateQuarkus } from "./new-proj/create-quarkus";
import { CleanReact, CreateReact } from "./new-proj/create-react";
import { PromptUtils } from "../classes/prompt-utils";

const vorpal = new Vorpal();
const { HOME } = process.env;
let givenPath = `${HOME}/.meta-proj-cli/projects`;
let projName: string = null;
let projType: string = null;
let projVm: string = null;
let folderPath: string = null;
let repoPath: string = null;
let hasFolder = false;
let hasReadme = false;
let kotlin = true;
let gradle = true;

/**
 * Prompts the user and runs corresponding commands
 */
async function action() {

  try {
    const nameResult = await PromptUtils.inputPrompt(this, "Give a name for the project: ");

    if (nameResult) {
      projName = nameResult;
    } else {
      throw new Error("No name was given for the project");
    }

    const typeResult = await PromptUtils.listPrompt(this, "Framework for the project: ", [ "Quarkus", "React", "No framework" ]);

    if (typeResult) {
      projType = typeResult;
    } else {
      throw new Error("No type was given for the project");
    }

    const vmResult = await PromptUtils.listPrompt(this, "Add virtual environment for the project: ", [ "None", "Docker", "Minikube" ]);

    if (vmResult) {
      projVm = vmResult;

    } else {
      throw new Error("No environment option was given for the project");
    }

    const pathResult = await PromptUtils.inputPrompt(this, "Set a path where to initiate repository, leave empty for default: ");

    if (pathResult) {
      givenPath = pathResult;
    }
  } catch (err) {
    throw new Error(`Error while prompting: ${err}`);
  }

  await resolvePaths();
  await runExecSync(`mkdir ${folderPath}`);
  hasFolder = true;
  
  if (projType == "Quarkus") {
    this.log("Creating Quarkus project - please wait...");
    try {
      const kotlinResult = await PromptUtils.confirmPrompt(this, "Use Kotlin?: "); 

      const gradleResult = await PromptUtils.confirmPrompt(this, "Use Gradle?: ");

      if (!kotlinResult || !gradleResult) {
        kotlin = false;
        gradle = false;
      } else {
        kotlin = kotlinResult;
        gradle = gradleResult;
      }
      await initQuarkusProject();

    } catch (err) {
      throw new Error(`Error when attempting to init ${projType} project: ${err}`);
    }
    
  }

  if (projType == "React") {
    this.log("Creating react project - please wait...");
    
    await initReactProject();
    hasReadme = true;
  }

  if (projType == "No framework") {
    this.log("Creating project - please wait...");
    await initDefaultProject();
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

  await repoViaVorpal();

  try {
    const testResult = await PromptUtils.confirmPrompt(this, `Do you want to run a test for ${projName}?`);

    if (testResult) {
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
    await runExecSync(cmd, { cwd: folderPath });

    const cmds: string[] = await CleanReact(folderPath, repoPath);
    for (let i = 0; i < cmds.length; i++) {
      if (i < 9) {
        await runExecSync(cmds[i], { cwd: repoPath });
      } else {
        await runExecSync(cmds[i], { cwd: `.${path.sep}resources` });
      }
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
    await runExecSync(cmd, { cwd: folderPath });

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
    .execSync(`new-repo ${projName} --path ${givenPath} ${hasFolder ? "--hasFolder" : ""} ${hasReadme ? "--hasReadme" : ""}`);

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

import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
import { test } from "./checkTest";
import { PathUtils } from "../classes/path-utils";
import { CreateDefault } from "./new-proj/create-default";
import * as path from "path";
import { runExecSync } from "../classes/exec-sync-utils";
import { AWSUtils } from "../classes/aws-utils";
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
let aws = false;
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

    const awsResult = await this.prompt({
      type: "list",
      name: "aws",
      choices: [ "Yes", "No" ],
      message: "Attach project to AWS: "
    });

    if (awsResult.aws) {
      (awsResult.aws == "Yes") ? aws = true : aws = false;
    }
  } catch (err) {
    throw new Error(`Error while prompting: ${err}`);
  }

  resolvePaths();
  
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
      hasFolder = true;

    } catch (err) {
      throw new Error(`Error when attempting to init ${projType} project: ${err}`);
    }
    
  }

  if (projType == "React") {
    this.log("Creating react project - please wait...");
    
    await initReactProject();
    hasFolder = true;
    hasReadme = true;
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

  await repoViaVorpal();

  if (aws) {
    await attachAWS(this);
  }

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
    await runExecSync(cmd);

    const cmds: string[] = await CleanReact(folderPath, repoPath);
    for (let i = 0; i < cmds.length; i++) {
      if (i < 9) {
        await runExecSync(cmds[i]);
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
    await runExecSync(cmd);

  } catch(err) {
    throw new Error(`Error when creating project: ${err}`);
  }
}

/**
 * Attachs AWS to the project
 * 
 * @param {any} instance Vorpal instance for inquiry.
 */
async function attachAWS(instance: any) {
  let access: string = null;
  let secret: string = null;
  try {
    const configResult = await PromptUtils.listPrompt(
      instance,
      "Do you have an AWS config file under home location /.aws/config : ",
      [ "Yes", "No" ]
    );

    if (configResult) {
      let cmds: string[] = [];
      if (configResult == "No") {
        const accessResult = await PromptUtils.inputPrompt(instance, "Access key ID for AWS: ");
        accessResult ? access = accessResult : access = "";

        const secretResult = await PromptUtils.inputPrompt(instance, "Access key Secret for AWS: ");
        secretResult ? secret = secretResult : secret = "";
        cmds = await AWSUtils.configAWS(projName, access, secret);
      }
      if (configResult == "Yes") {
        cmds = await AWSUtils.configAWS(projName);
      }
      for (const cmd in cmds) {
        await runExecSync(cmd);
      }
    } else {
      throw new Error("Inquiry for config was stopped by the user.");
    }

  const pwResult = await PromptUtils.inputPrompt(instance, "Add password for DB master 'root' (minimum 8 characters): ");
  if (pwResult) {
    if(pwResult.length < 8) {
      throw new Error("The DB master password was too short.");
    }
  } else {
    throw new Error("The DB master password has to be set.");
  }

  const portResult = await PromptUtils.inputPrompt(instance, "Port for DB (range 1150-65535): ");
  if (!portResult) {
    throw new Error("The DB port has to be set.");
  }

  const storageResult = await PromptUtils.inputPrompt(instance, "Allocated storage for DB, leave empty for default (20): ");
  const tagKeyResult = await PromptUtils.inputPrompt(instance, "Setting Tag (Key-Value). Give a tag Key for the DB: ");
  const tagValueResult = await PromptUtils.inputPrompt(instance, "Setting Tag (Key-Value). Give a tag Value for the DB: ");

  let subnetGrpName: string = null;
  const subnetGrps = await runExecSync("aws rds describe-db-subnet-groups");
  if(subnetGrps) {
    const grpsJson = JSON.parse(subnetGrps);
    for (const subnetGrp of grpsJson.DBSubnetGroups) {
      if (subnetGrp.VpcId.toString() == "vpc-0f373251e71b37870") {
        subnetGrpName = subnetGrp.DBSubnetGroupName.toString();
      }
    }
  }

  const createDB: string = AWSUtils.createDBInstance(
    projName,
    subnetGrpName ? subnetGrpName : "default-vpc-0f373251e71b37870",
    {
      password: pwResult,
      port: Number(portResult),
      storage: storageResult ? Number(storageResult) : 20,
      tag: {
        Key: tagKeyResult ? tagKeyResult : `project`,
        Value: tagValueResult ? tagValueResult : `${projName}`
      }
    }
  );
  await runExecSync(createDB);
  const configKube: string = AWSUtils.configKube("meta-cli");
  await runExecSync(configKube);

  } catch (err) {
    throw new Error(`Error when setting up AWS: ${err}`);
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

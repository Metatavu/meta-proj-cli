import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
import { test } from "./checkTest";
import { PathUtils } from "../classes/path-utils";
import { CreateDefault } from "./new-proj/create-default";
import * as path from "path";
import { runExecSync } from "../classes/exec-sync-utils";
import { KubeComponent } from "../interfaces/types";
import KubeUtils from "../classes/kube-utils";
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
        let componentsArr: string[] = [];
        let keyCloak = false;
        const componentResult = await PromptUtils.checkboxPrompt(
          this,
          "Components for Minikube (max one of each): ",
          [ "Pod", "Service", "Deployment" ]
        );
        componentResult ? componentsArr = componentResult : componentsArr = null;

        let image: string = null;
        const imageResult = await PromptUtils.inputPrompt(this, "Set an image for pod / deployment, leave empty for default: ");
        imageResult ? image = imageResult : image = "";

        let port: number = null;
        let replicas: number = null;
        if (componentsArr.indexOf("Pod") != -1) {
          const portResult = await PromptUtils.inputPrompt(this, "Set a port for pod, leave empty for default (3000): ");
          portResult ? port = Number(portResult) : port = 3000;

          const replicaResult = await PromptUtils.inputPrompt(this, "Set an amount of replicas of pod, leave empty for default (1): ");
          replicaResult ? replicas = Number(replicaResult) : replicas = 1;
        }

        let portType: string = null;
        if (componentsArr.indexOf("Service") != -1) {
          const portTypeResult = await PromptUtils.inputPrompt(this, "Set a port type for service, leave empty for default (NodePort): ");
          portTypeResult ? portType = portTypeResult : portType = "NodePort";
        }

        const ports = [];
        if (componentsArr.indexOf("Service") != -1 || componentsArr.indexOf("Deployment") != -1) {
          const nameResult = await PromptUtils.inputPrompt(this, "Set a port name, leave empty for default (tcp): ");
          
          const portResult = await PromptUtils.inputPrompt(this, "Set a port for pod, leave empty for default (3000): ");

          const protocolResult = await PromptUtils.inputPrompt(this, "Set a protocol for port, leave empty for default (TCP): ");

          ports.push({
            name: nameResult ? nameResult : "tcp",
            port: portResult ? portResult : 3000,
            containerPort: portResult ? portResult : 3000,
            protocol: protocolResult ? protocolResult : "TCP"
          });
        }
        this.log("Check that your Docker is running before proceeding.");
        const keyCloakResult = await PromptUtils.confirmPrompt(this, "Attach KeyCloak to Minikube : ");
        keyCloak = keyCloakResult;

        if (keyCloak) {
          const attachKc: string = await KubeUtils.attachKeyCloak(repoPath);
          await runExecSync(attachKc, { cwd: `.${path.sep}resources` });
        }
        
        await attachToMinikube(componentsArr, image, port, portType, ports, replicas);
        await runExecSync(`kustomize create --autodetect`, { cwd: repoPath });
        await runExecSync("minikube start");
        if (keyCloak) {
          await runExecSync("minikube addons enable ingress");
        }
        await runExecSync(`kubectl create -f kustomization.yaml`, { cwd: repoPath });
        const kubeIP: string | void = (await runExecSync("minikube ip"));
        if (kubeIP) {
          await KubeUtils.createIngress(kubeIP, repoPath);
          await runExecSync(`kubectl create -f keycloak-ingress.yaml`, { cwd: repoPath });
        } else {
          this.log("Could not fetch Minikube IP. Failed to create Ingress for KeyCloak.");
        }
        this.log("Completed building Minikube setup. Please note that your Minikube is now running.");
      } catch (err) {
        throw new Error(`Error when attempting to init project into Minicube: ${err}`);
      }
    } 
  }

  repoViaVorpal();

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
 * Gets OS-specific version of path and resolves it into the outer and inner folder
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
 * Attachs possibly wanted components to Minikube
 * 
 * @param {string} compsArr Array of components
 * @param {string} image Image for component, if any
 * @param {number} port Port for component (Pod)
 * @param {string} portType Port type for port (Service)
 * @param {Array<unknown>} ports Ports for component (Service/Deployment)
 * @param {number} replicas Replicas of component, if any
 */
async function attachToMinikube(compsArr: string[], image: string, port: number, portType: string, ports: Array<unknown>, replicas: number) {
  const componentsArr: KubeComponent[] = [];
  for (const comp in compsArr) {
    componentsArr.push({
      args: {
        name: `${projName}-${comp}`,
        image: image,
        port: port,
        portType: portType,
        ports: ports,
        replicas: replicas
      },
      type: comp,
      namespace: projName
    });
  }
  await KubeUtils.createComponents(componentsArr, repoPath);
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

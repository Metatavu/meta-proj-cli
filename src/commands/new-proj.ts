import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
import { test } from "./checkTest";
import { PathUtils } from "../classes/path-utils";
import { CreateDefault } from "./new-proj/create-default";
import * as path from "path";
import { runExecSync } from "../classes/exec-sync-utils";
import { KubeComponent } from "../interfaces/types";
import MinikubeUtils from "../classes/minikube-utils";

const vorpal = new Vorpal();
const { HOME } = process.env;
let givenPath = `${HOME}/.meta-proj-cli/projects`;
let projName: string = null;
let projType: string = null;
let projVm: string = null;
let folderPath: string = null;
let repoPath: string = null;

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
    //To do: Add quarkus
    this.log("Creating Quarkus project - please wait...");
  }

  if (projType == "React") {
    //To do: Add React
    this.log("Creating react project - please wait...");
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
        const componentResult = await this.prompt({
          type: "checkbox",
          name: "components",
          choices: [ "Pod", "Service", "Deployment" ],
          message: "Components for Minikube (max one of each): "
        });
        componentResult.components ? componentsArr = componentResult.components : componentsArr = null;

        let image: string = null;
        const imageResult = await this.prompt({
          type: "input",
          name: "image",
          message: "Set an image for pod / deployment, leave empty for default: "
        });
        imageResult.image ? image = imageResult.image : image = "";

        let port: number = null;
        let replicas: number = null;
        if (componentsArr.indexOf("Pod") != -1) {
          const portResult = await this.prompt({
            type: "input",
            name: "port",
            message: "Set a port for pod, leave empty for default (3000): "
          });
          portResult.port ? port = Number(portResult.port) : port = 3000;

          const replicaResult = await this.prompt({
            type: "input",
            name: "replicas",
            message: "Set an amount of replicas of pod, leave empty for default (1): "
          });
          replicaResult.replicas ? replicas = Number(replicaResult.replicas) : replicas = 1;
        }

        let portType: string = null;
        if (componentsArr.indexOf("Service") != -1) {
          const portTypeResult = await this.prompt({
            type: "input",
            name: "portType",
            message: "Set a port type for service, leave empty for default (NodePort): "
          });
          portTypeResult.portType ? portType = portTypeResult.portType : portType = "NodePort";
        }

        const ports = [];
        if (componentsArr.indexOf("Service") != -1 || componentsArr.indexOf("Deployment") != -1) {
          const nameResult = await this.prompt({
            type: "input",
            name: "name",
            message: "Set a port name, leave empty for default (tcp): "
          });
          
          const portResult = await this.prompt({
            type: "input",
            name: "port",
            message: "Set a port for pod, leave empty for default (3000): "
          });

          const protocolResult = await this.prompt({
            type: "input",
            name: "protocol",
            message: "Set a protocol for port, leave empty for default (TCP): "
          });

          ports.push({
            name: nameResult.name ? nameResult.name : "tcp",
            port: portResult.port ? portResult.port : 3000,
            containerPort: portResult.port ? portResult.port : 3000,
            protocol: protocolResult.protocol ? protocolResult.protocol : "TCP"
          });
        }
        this.log("Check that your Docker is running before proceeding.");
        const keyCloakResult = await this.prompt({
          type: "list",
          name: "keyCloak",
          choices: [ "Yes", "No" ],
          message: "Attach KeyCloak to Minikube : "
        });
        keyCloak = (keyCloakResult.keyCloak == "Yes");

        if (keyCloak) {
          const attachKc: string = await MinikubeUtils.attachKeycloak(repoPath);
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
          await MinikubeUtils.createIngress(kubeIP, repoPath);
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
      type: comp
    });
  }
  await MinikubeUtils.createComponents(componentsArr, repoPath);
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

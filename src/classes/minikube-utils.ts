import YamlUtils from "./yaml-utils";
import { CommandNames, KubeComponent } from "../interfaces/types";
import OsUtils from "./os-utils";

/**
 * Provides utilities for initialising a project into Minikube
 */
export default class MinikubeUtils {

  /**
   * Creates a Minikube component (pod, service, deployment) .yaml file that is
   * used to create the component itself
   * 
   * @param {KubeComponent[]} compArr Array of components
   * @param {string} repoPath String to project repository path where files are written to
   */
  public static async createComponents(compArr: KubeComponent[], repoPath: string): Promise<void> {
    try {
      for (let i = 0; i < compArr.length; i++) {
        await YamlUtils.createYaml(compArr[i].args, compArr[i].type, repoPath);
      }
    } catch (err) {
      Promise.reject(`Ran into an error when attempting to setup a .yaml file: ${err}`);
    }
    
  }

  /**
   * Returns a command string for attaching KeyCloak into Minikube
   * 
   * @param repoPath Repository path where to write file
   * @returns a command string which can be run to attach KeyCloak to project
   */
  public static async attachKeycloak(repoPath: string): Promise<string> {
    const copy = await OsUtils.getCommand(CommandNames.copy);
    return `${copy} keycloak.yaml ${repoPath}`;
  }

  /**
   * Creates Ingress creation file for KeyCloak
   * 
   * @param kubeIP Minikube IP address
   * @param repoPath Repository path where to write file
   */
  public static async createIngress(kubeIP: string, repoPath: string): Promise<void> {
    await YamlUtils.attachKeyCloak(kubeIP, repoPath);
  }

  /**
   * Finish build that is run after all of the necessary components have been created,
   * possibly Keycloak has been attached or possibly RDS has been attached
   * 
   * @returns {string[]} Array that contains command string to finish the build
   */
  public static finishBuild(): string[] {
    return ["kustomize create --autodetect", "kubectl create -f kustomization.yaml"];
  }
}
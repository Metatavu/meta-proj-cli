import YamlUtils from "./yaml-utils";
import { KubeComponent } from "../interfaces/types";

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
   * Creates a .yaml file for RDS Cluster setup that is used to attach it to Minikube
   * 
   * @param {string} name Project name for the new cluster setup
   * @param {string} repoPath Path where to write the cluster.yaml file
   */
  public static async createCluster(name: string, repoPath: string): Promise<void> {
    try {
      await YamlUtils.createClusterYaml(name, repoPath);
    } catch (err) {
      Promise.reject(`Ran into an error when attempting to setup cluster.yaml file: ${err}`);
    }
    
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
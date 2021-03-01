import YamlUtils from "./yaml-utils";
import { KubeComponent, KubeArgs } from "../interfaces/types";

export default class MinikubeUtils {

  /**
   * Creates a Minikube component (pod, service, deployment) .yaml file that is
   * used to create the component itself
   * 
   * @param {KubeComponent[]} compArr Array of components
   * @param {string} repoPath String to project repository path where files are written to
   */
  public async createComponents(compArr: KubeComponent[], repoPath: string): Promise<void> {

    for (const comp in compArr) {
      YamlUtils.createYaml(comp.args, comp.type, repoPath);
    }
  }

  /**
   * Finish build that is run after all of the necessary components have been created,
   * possibly Keycloak has been attached or possibly RDS has been attached
   * 
   * @returns {string[]} Array that contains command string to finish the build
   */
  public finishBuild(): string[] {
    return ["kustomize create --autodetect", "kubectl create -f kustomization.yaml"];
  }
}
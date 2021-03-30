import fs from "fs";
import * as path from "path";
import YAML from "yaml";
import OsUtils from "./os-utils";
import { CommandNames, KubeArgs, KubeComponent, YamlEnv } from "../interfaces/types";

/**
 * Provides CRUD operations on .yaml files that are used in projects.
 * "UPDATE" operation is yet to be implemented, as it probably won't be necessary.
 */
export default class YamlUtils {

  /**
   * CREATE
   * Creates .yaml files that are used when putting up a project into Kubernetes Minikube
   * 
   * @param args Object that includes needed values for setting up the .yaml files
   * @param type Type of Kubernetes component, either service or deployment
   * @param projName Project name, which in this case is also the namespace
   * @param repoPath Repository path where to init .yaml files
   */
  public static createYaml = async (args: KubeArgs, type: string, projName: string, repoPath: string, pod?: KubeComponent): Promise<void> => {
    try {
      let file = YAML.parse(fs.readFileSync(`./resources/${type}.yaml`, "utf8"));
      file.metadata.name = args.name;
      const labels = file.metadata.labels;

      if (labels) {

        if (labels.app) {
          labels.app = projName;
        }

        if (labels.run) {
          labels.run = projName;
        }
      }
      file.metadata.labels = labels;

      switch (type) {

        case "service":
          file = YamlUtils.setupService(args, projName, file);
          break;
        
        case "deployment":
          file = YamlUtils.setupDeployment(args, projName, file, pod);
          break;
      }
      fs.writeFileSync(`${repoPath + path.sep + type}.yaml`, YAML.stringify(file));

    } catch (err) {
      Promise.reject(`Error creating ${type}.yaml: ${err}`);
    }
    
  }

  /**
   * READ
   * Prints out an existing .yaml file
   * 
   * @param type Type of Kubernetes component / file name
   * @param repoPath Repository path where .yaml files are located
   */
  public static printYaml = async (type: string, repoPath: string): Promise<void> => {
    try {
      const file = YAML.parse(fs.readFileSync(`${repoPath + path.sep + type}.yaml`, "utf8"));
      console.log(file);
    } catch (err) {
      Promise.reject(`Error when reading file: ${err}`);
    }
    
  }

  /**
   * Enables connectivity to an AWS database from Minikube deployment
   * 
   * @param envArr Array which contains the data for connection
   * @param repoPath Repository path where deployment.yaml is located
   */
  public static attachAWS = async (envArr: YamlEnv[], repoPath: string): Promise<void> => {
    const file = YAML.parse(fs.readFileSync(`${repoPath + path.sep}deployment.yaml`, "utf8"));
    if (file.spec.template.spec.containers[1]) {
      for (const env in envArr) {
        file.spec.template.spec.containers[1].env.push(env);
      }
    }
  }

  /**
   * Creates Ingress file for KeyCloak
   * 
   * @param kubeIP Minikube IP address
   * @param repoPath Repository path where to write file
   */
  public static attachKeyCloak = async (kubeIP: string, repoPath: string): Promise<void> => {
    const file = YAML.parse(fs.readFileSync("./resources/keycloak-ingress.yaml", "utf8"));
    file.spec.tls[0].hosts[0] = `keycloak.${kubeIP}.nip.io`;
    file.spec.rules[0].host = `keycloak.${kubeIP}.nip.io`;
    fs.writeFileSync(`${repoPath + path.sep}keycloak-ingress.yaml`, YAML.stringify(file));
  }

  /**
   * DELETE
   * Creates a delete command for a .yaml file, if one is deemed to be unnecessary or faulty
   * 
   * @param type Type of Kubernetes component / file name
   * @param repoPath Repository path where .yaml files are located
   * @returns a command string to be executed for the file deletion
   */
  public static deleteYaml = async (type: string, repoPath: string): Promise<string> => {
    const del = await OsUtils.getCommand(CommandNames.remove);
    return `${del} ${repoPath + path.sep + type}.yaml`;
  }

  /**
   * Setup service.yaml
   * 
   * @param args Object that includes needed values for setting up the .yaml files
   * @param projName Project name, which in this case is also the namespace
   * @param file The JSON file that is being edited to create a .yaml file
   * @returns the edited JSON file for service
   */
  private static setupService = (args: KubeArgs, projName: string, file: any): any => {

    file.metadata.labels.run = projName;

    if (args.ports) {
      file.spec.ports = [];
      for (const port in args.ports) {
        file.spec.ports.push(port);
      }
    }
    file.spec.selector.app = projName;
    if (args.portType) {
      file.spec.type = args.portType;
    }
    return file;
  }

  /**
   * Setup deployment.yaml
   * 
   * @param args Object that includes needed values for setting up the .yaml files
   * @param projName Project name, which in this case is also the namespace
   * @param file The JSON file that is being edited to create a .yaml file
   * @param pod if any, Pod that is included in the Deployment
   * @returns the edited JSON file for deployment
   */
  private static setupDeployment = (args: KubeArgs, projName: string, file: any, pod: KubeComponent): any => {

    file.metadata.labels.app = projName;
    file.spec.selector.app = projName;
    file.spec.selector.matchLabels.app = projName;
    file.spec.template.metadata.app = projName;
    file.spec.template.metadata.labels.app = projName;
    const containerObj = file.spec.template.spec.containers[0];

    if (containerObj && pod) {
      containerObj.name = pod.args.name;

      (pod.args.image) ? containerObj.image = pod.args.image : containerObj.image = null;

      if (pod.args.ports && containerObj) {
        containerObj.ports = [];
        for (const port of pod.args.ports) {
          containerObj.ports.push(port);
        }
      }
      file.spec.template.spec.containers[0] = containerObj;
    }
    
    if (args.replicas) {
      file.spec.replicas = args.replicas;
    }
    return file;
  }
}

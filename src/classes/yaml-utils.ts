import fs from "fs";
import * as path from "path";
import YAML from "yaml";
import OsUtils from "./os-utils";
import { CommandNames, KubeArgs, YamlEnv } from "../interfaces/types";

const { IP_ONE } = process.env;
const { IP_TWO } = process.env;

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
   * @param type Type of Kubernetes component, either pod, service or deployment
   * @param repoPath Repository path where to init .yaml files
   */
  public static createYaml = async (args: KubeArgs, type: string, namespace: string, repoPath: string): Promise<void> => {
    try {
      let file = YAML.parse(fs.readFileSync(`./resources/${type}.yaml`, "utf8"));
      file.metadata.name = args.name;
      const labels = file.metadata.labels;

      if (labels) {

        if (labels.app) {
          labels.app = args.name;
        }

        if (labels.run) {
          labels.run = args.name;
        }
      }
      file.metadata.labels = labels;

      switch (type) {

        case "pod":
          file = YamlUtils.setupPod(args, namespace, file);
          break;

        case "service":
          file = YamlUtils.setupService(args, namespace, file);
          break;
        
        case "deployment":
          file = YamlUtils.setupDeployment(args, namespace, file);
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
   * @param type Type of Kubernetes component, either pod, service or deployment
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
   * Attachs AWS into Minikube, if needed
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
  public static attachKeycloak = async (kubeIP: string, repoPath: string): Promise<void> => {
    const file = YAML.parse(fs.readFileSync("./resources/keycloak-ingress.yaml", "utf8"));
    file.spec.tls[0].hosts[0] = `keycloak.${kubeIP}.nip.io`;
    file.spec.rules[0].host = `keycloak.${kubeIP}.nip.io`;
    fs.writeFileSync(`${repoPath + path.sep}keycloak-ingress.yaml`, YAML.stringify(file));
  }

  /**
   * DELETE
   * Creates a delete command for a .yaml file, if one is deemed to be unnecessary or faulty
   * 
   * @param type Type of Kubernetes component, either pod, service or deployment
   * @param repoPath Repository path where .yaml files are located
   * @returns a command string to be executed for the file deletion
   */
  public static deleteYaml = async (type: string, repoPath: string): Promise<string> => {
    const del = await OsUtils.getCommand(CommandNames.remove);
    return `${del} ${repoPath + path.sep + type}.yaml`;
  }

  /**
   * Setup pod.yaml
   * 
   * @param args Object that includes needed values for setting up the .yaml files
   * @param file The JSON file that is being edited to create a .yaml file
   * @returns the edited JSON file for pod
   */
  private static setupPod = (args: KubeArgs, namespace: string, file: any): any => {

    file.metadata.name = args.name;
    const containerObj = file.spec.containers[0];

    if (containerObj){

      containerObj.name = namespace;
      (args.image) ? containerObj.image = args.image
      : containerObj.image = null;

      if (args.port && containerObj.ports[0]) {
        containerObj.ports[0].containerPort = args.port;
      }
      file.spec.containers[0] = containerObj;
    }
    return file;
  }

  /**
   * Setup service.yaml
   * 
   * @param args Object that includes needed values for setting up the .yaml files
   * @param file The JSON file that is being edited to create a .yaml file
   * @returns the edited JSON file for service
   */
  private static setupService = (args: KubeArgs, namespace: string, file: any): any => {

    file.metadata.name = args.name;
    file.metadata.labels.run = namespace;

    if (args.ports) {
      file.spec.ports = [];
      for (const port in args.ports) {
        file.spec.ports.push(port);
      }
    }
    file.spec.selector.app = namespace;
    if (args.portType) {
      file.spec.type = args.portType;
    }
    return file;
  }

  /**
   * Setup deployment.yaml
   * 
   * @param args Object that includes needed values for setting up the .yaml files
   * @param file The JSON file that is being edited to create a .yaml file
   * @returns the edited JSON file for deployment
   */
  private static setupDeployment = (args: KubeArgs, namespace: string, file: any): any => {

    file.metadata.name = args.name;
    file.metadata.labels.app = namespace;
    file.spec.selector.app = args.name;
    file.spec.selector.matchLabels.app = namespace;
    file.spec.template.metadata.app = args.name;
    file.spec.template.metadata.labels.app = namespace;
    const containerObj = file.spec.template.spec.containers[0];

    if (containerObj) {
      containerObj.name = args.name;

      (args.image) ? containerObj.image = args.image : containerObj.image = null;

      if (args.ports && containerObj) {
        containerObj.ports = [];
        for (const port in args.ports) {
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

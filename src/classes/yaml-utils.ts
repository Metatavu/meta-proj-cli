import fs from "fs";
import * as path from "path";
import YAML from "yaml";
import OsUtils from "./os-utils";

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
  public static createYaml = async (args: any, type: string, repoPath: string): Promise<void> => {

    let file: any = fs.readFileSync(`./resources/${type}.json`);
    file.metadata.name = args.name;

    if (file.metadata.labels) {

      if (file.metadata.labels.app) {
        file.metadata.labels.app = args.name;
      }

      if (file.metadata.labels.run) {
        file.metadata.labels.run = args.name;
      }
    }

    switch (type) {

      case "pod":
        file = YamlUtils.setupPod(args, file);
        break;

      case "service":
        file = YamlUtils.setupService(args, file);
        break;
      
      case "deployment":
        file = YamlUtils.setupDeployment(args, file);
        break;
    }

    fs.writeFileSync(`${repoPath + path.sep + type}.yaml`, YAML.stringify(file));
  }

  /**
   * READ
   * Prints out an existing .yaml file
   * 
   * @param type Type of Kubernetes component, either pod, service or deployment
   * @param repoPath Repository path where .yaml files are located
   */
  public static printYaml = async (type: string, repoPath: string): Promise<void> => {
    let file = YAML.parse(fs.readFileSync(`${repoPath + path.sep + type}.yaml`, "utf8"));
    console.log(file);
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
    const del = await OsUtils.getCommand("delete");
    return `${del} ${repoPath + path.sep + type}.yaml`;
  }

  /**
   * Setup pod.yaml
   * 
   * @param args Object that includes needed values for setting up the .yaml files
   * @param file The JSON file that is being edited to create a .yaml file
   */
  private static setupPod = (args: any, file: any): any => {
    file.spec.containers[0].name = args.name;
    if (args.image) file.spec.containers[0].image = args.image;
    if (args.port) file.spec.containers[0].ports[0].containerport = args.port;
    return file;
  }

  /**
   * Setup service.yaml
   * 
   * @param args Object that includes needed values for setting up the .yaml files
   * @param file The JSON file that is being edited to create a .yaml file
   */
  private static setupService = (args: any, file: any): any => {
    if (args.ports) {
      file.spec.ports = [];
      for (let port in args.ports) file.spec.ports.push(port);
    }
    file.spec.selector.app = args.name;
    if (args.portType) file.spec.type = args.portType;
    return file;
  }

  /**
   * Setup deployment.yaml
   * 
   * @param args Object that includes needed values for setting up the .yaml files
   * @param file The JSON file that is being edited to create a .yaml file
   */
  private static setupDeployment = (args: any, file: any): any => {
    file.spec.selector.app = args.name;
    file.spec.template.metadata.app = args.name;
    file.spec.template.spec.containers[0].name = args.name;

    if (args.image) file.spec.template.spec.containers[0].image = args.image;
    if (args.ports) {
      file.spec.template.spec.containers[0].ports = []
      for (let port in args.ports) file.spec.template.spec.containers[0].ports.push(port);
    }
    if (args.env) {
      for (let env in args.env) file.spec.template.spec.containers[1].env.push(env);
    }
    if (args.replicas) file.spec.replicas = args.replicas;
    return file;
  }
}

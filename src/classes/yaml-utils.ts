import fs from "fs";
import * as path from "path";
import YAML from "yaml";
import OsUtils from "./os-utils";
import { CommandNames, KubeArgs } from "../interfaces/types";

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
  public static createYaml = async (args: KubeArgs, type: string, repoPath: string): Promise<void> => {
    try {
      let file = YAML.parse(fs.readFileSync(`./resources/${type}.yaml`, "utf8"));
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

    } catch (err) {
      Promise.reject(`Error creating ${type}.yaml: ${err}`);
    }
    
  }

  /**
   * Creates cluster.yaml to attach a Minikube project into RDS
   * 
   * @param {string} name Project/cluster name that is used when creating cluster
   * @param {string} repoPath Path where project is being initialized
   */
  public static createClusterYaml = async (name: string, repoPath: string): Promise<void> => {
    try {
      const file = YAML.parse(fs.readFileSync("./resources/cluster.yaml", "utf8"));
      file.metadata.name = name;
      file.iam.serviceAccounts[0].metadata.name = `${name}-cluster`;
      file.iam.serviceAccounts[0].metadata.namespace = name;
      file.vpc.id = `${name}-vpc`;
      const subnets = { public: {} };
        subnets.public[name + "-subnet-one"] = {
          "az": "us-east-2a",
          "cidr": `${IP_ONE}/25`
        };
        subnets.public[name + "-subnet-two"] = {
          "az": "us-east-2b",
          "cidr": `${IP_TWO}/25`
        } 
      file.vpc.subnets = subnets;
      file.nodeGroups[0].name = `${name}-nodegroup`;
      file.nodeGroups[0].instanceName = `${name}-nodegroup-1`;
      file.nodeGroups[0].subnets = [`${name}-subnet-one`,`${name}-subnet-two`];
      fs.writeFileSync(`${repoPath + path.sep}cluster.yaml`, YAML.stringify(file));

    } catch (err) {
      Promise.reject(`Error creating cluster.yaml: ${err}`);
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
  private static setupPod = (args: KubeArgs, file: any): any => {
    const containerObj = file.spec.containers[0];
    if (containerObj){

      containerObj.name = args.name;
      if (args.image) {
        containerObj.image = args.image;
      }
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
  private static setupService = (args: KubeArgs, file: any): any => {
    if (args.ports) {
      file.spec.ports = [];
      for (const port in args.ports) {
        file.spec.ports.push(port);
      }
    }
    file.spec.selector.app = args.name;
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
  private static setupDeployment = (args: KubeArgs, file: any): any => {
    file.spec.selector.app = args.name;
    file.spec.template.metadata.app = args.name;
    const containerObj = file.spec.template.spec.containers[0];

    if (containerObj) {
      containerObj.name = args.name;

      if (args.image) {
        containerObj.image = args.image;
      }
      if (args.ports && containerObj) {
        containerObj.ports = [];
        for (const port in args.ports) {
          containerObj.ports.push(port);
        }
      }
      file.spec.template.spec.containers[0] = containerObj;
    }
    
    if (args.env && file.spec.template.spec.containers[1]) {
      for (const env in args.env) {
        file.spec.template.spec.containers[1].env.push(env);
      }
    }
    if (args.replicas) {
      file.spec.replicas = args.replicas;
    }
    return file;
  }
}

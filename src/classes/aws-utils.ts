import fs from "fs";
import { ClusterConfig, OperatingSystems } from "../interfaces/types";
import OsUtils from "./os-utils";
import { PathUtils } from "./path-utils";
import YamlUtils from "./yaml-utils";

const { HOME } = process.env;
let configPath = `${HOME}/.aws/config`;

export class AWSUtils {

  /**
   * Configures AWS CLI credentials for eksctl & aws cli usage
   * 
   * @param projName Project name that is also the cluster name
   * @param access AWS access key ID
   * @param secret AWS secret access key
   * @returns {string[]} array of commands to run config .sh in the main thread
   */
  public static configAWS = async (projName: string, access? : string, secret?: string): Promise<string[]> => {
    try {
      configPath = await PathUtils.fixPath(configPath);
      const os: string = await OsUtils.getOS();
      return (os == OperatingSystems.LINUX || os == OperatingSystems.MAC) ?
      ["chmod +x aws-configure.sh", `./aws-configure.sh -n ${projName} ${access} ${secret}`] 
      : [];

    } catch (err) {
      return Promise.reject(`Error when trying to config AWS: ${err}`);
    }
  }

  /**
   * Creates cluster .yaml that is used to create the cluster itself
   * 
   * @param name Project name / cluster name
   * @param args User input arguments
   * @param repoPath Repository path where to init cluster.yaml
   */
  public static createCluster = async (name: string, args: ClusterConfig, repoPath: string): Promise<void> => {
    if (!args.vpcIP) {
      return Promise.reject("No VPC CIDR IP has been set.");

    } else {
    args.desiredCapacity ? args.desiredCapacity : args.desiredCapacity = 1;
    args.minSize ? args.minSize : args.minSize = 1;
    args.maxSize ? args.maxSize : args.maxSize = 2;
    args.volumeSize ? args.volumeSize : args.volumeSize = 20;
    args.clusterLabel ? args.clusterLabel : args.clusterLabel = "cluster-ops";
    args.ngLabel ? args.ngLabel : args.ngLabel = "frontend-workloads";

    await YamlUtils.createClusterYaml(name, args, repoPath);
    }
    
  }

  /**
   * Creates a command string for configuring Kubeconfig for the project
   * 
   * @param projName Project name / cluster name
   */
  public static configKube = (projName: string): string => {
    return `aws eks --region us-east-2 update-kubeconfig --name ${projName}`;
  }
}
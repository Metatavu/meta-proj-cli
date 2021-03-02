import fs from "fs";
import { ClusterConfig, OperatingSystems } from "../interfaces/types";
import OsUtils from "./os-utils";
import { PathUtils } from "./path-utils";
import YamlUtils from "./yaml-utils";

const { HOME } = process.env;
let configPath = `${HOME}/.aws/config`;

export class AWSUtils {

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

  public static configKube = (projName: string): string => {
    return `aws eks --region us-east-2 update-kubeconfig --name ${projName}`;
  }
}
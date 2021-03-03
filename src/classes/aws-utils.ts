import fs from "fs";
import { ClusterConfig, OperatingSystems } from "../interfaces/types";
import OsUtils from "./os-utils";
import { PathUtils } from "./path-utils";
import YamlUtils from "./yaml-utils";

const { HOME } = process.env;
let configPath = `${HOME}/.aws/config`;
let credsPath = `${HOME}/.aws/credentials`;

/**
 * Provides utilities for setting up AWS credentials, clusters and Kube configuration for AWS clusters
 */
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
      credsPath = await PathUtils.fixPath(credsPath);
      const os: string = await OsUtils.getOS();
      if (!access && !secret) {
        const fileData: string[] = (fs.readFileSync(configPath, "utf8").split("\n"));
        for (let i=0; i<fileData.length; i++) {
          if (fileData[i] == `[${projName}]`) {
            return (os == OperatingSystems.WINDOWS) 
            ? [`echo Found "${projName}" configuration. Not writing a new one.`, `SET AWS_PROFILE="${projName}"`]
            : [`echo Found "${projName}" configuration. Not writing a new one.`, `export AWS_PROFILE="${projName}"`];
          }
        }
      } else {
        return [
        `echo Writing "${projName}" configuration...`,
        `echo \n[${projName}]\nregion = us-east-2\noutput = yaml >> ${configPath}`,
        `echo \n[${projName}]\naws_access_key_id = ${access}\naws_secret_access_key = ${secret} >> ${credsPath}`
        ];
      }
      
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
    if (!args.desiredCapacity) {
      args.desiredCapacity = 1;
    }
    if (!args.minSize) {
      args.minSize = 1;
    }
    if (!args.maxSize) {
      args.maxSize = 2;
    }
    if (!args.volumeSize) {
      args.volumeSize = 20;
    }
    if (!args.clusterLabel) {
      args.clusterLabel = "cluster-ops";
    }
    if (args.ngLabel) {
      args.ngLabel = "frontend-workloads";
    }
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
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
        for (const line of fileData) {
          if (line == "[meta-cli]") {
            return (os == OperatingSystems.WINDOWS) 
            ? ['echo Found "[meta-cli]" configuration. Not writing a new one.', 'SET AWS_PROFILE="[meta-cli]"']
            : ['echo Found "[meta-cli]" configuration. Not writing a new one.', 'export AWS_PROFILE="[meta-cli]"'];
          }
        }
      } else {
        return [
        'echo Writing "[meta-cli]" configuration...',
        `echo \n[meta-cli]\nregion = us-east-2\noutput = yaml >> ${configPath}`,
        `echo \n[meta-cli]\naws_access_key_id = ${access}\naws_secret_access_key = ${secret} >> ${credsPath}`,
        "echo Configuring as Meta-cli"
        ];
      }

    } catch (err) {
      return Promise.reject(`Error when trying to config AWS: ${err}`);
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
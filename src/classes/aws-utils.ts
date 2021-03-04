import fs from "fs";
import { DBUserConfig, OperatingSystems } from "../interfaces/types";
import OsUtils from "./os-utils";
import { PathUtils } from "./path-utils";

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

      if (!access && !secret) {
        const fileData: string[] = (fs.readFileSync(configPath, "utf8").split("\n"));

        for (const line of fileData) {
          if (line == "[meta-cli]") {
            const os: string = await OsUtils.getOS();
            return (os == OperatingSystems.WINDOWS) ?
            ['echo Found "[meta-cli]" configuration. Not writing a new one.', 'SET AWS_PROFILE="[meta-cli]"'] :
            ['echo Found "[meta-cli]" configuration. Not writing a new one.', 'export AWS_PROFILE="[meta-cli]"'];
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
   * Returns a create db instance command string to be run in new-proj
   * 
   * @param {string} projName Project name
   * @param {DBUserConfig} userConfig User configuration for RDS
   */
  public static createDBInstance = (projName: string, userConfig: DBUserConfig): string => {
    return `aws rds create-db-instance \
    --db-name ${projName}-meta-cli-mysql
    --db-instance-identifier ${projName}-mysql \
    --db-instance-class db.t2.micro \
    --db-subnet-group-name default-vpc-0f373251e71b37870 \
    --engine mysql \
    --master-username root \
    --master-user-password ${userConfig.password} \
    --availability-zone us-east-2a \
    --db-cluster-identifier meta-cli \
    --kms-key-id arn:aws:rds:us-east-2:414711980085:db:meta-cli-mysql \
    --license-model general-public-license \
    --port ${userConfig.port} \
    --no-publicly-accessible \
    --storage-encrypted \
    --storage-type gp2
    --allocated-storage ${userConfig.storage} \
    --preferred-maintenance-window thu:03:10-thu:03:40
    --tags Key=${userConfig.tag.Key},Value=${userConfig.tag.Value}`;
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

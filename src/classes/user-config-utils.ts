import fs from "fs";
import { UserConfigJson } from "../interfaces/types";
import path from "path";

const userConfigPath = `.${path.sep}user-config.json`;
const userConfigTemplate = `.${path.sep}resources${path.sep}user-config-template.json`;

/**
 * Offers functions to read and write the cli's user config
 * 
 * @function readUserConfig runs a check after which it reads and returns the contents of user-config.json
 * 
 * @function writeUserConfig takes the edited version of the contents of user-config.json and writes them after a check
 * 
 * @function checkUserConfig checks that user-config.json exists and creates it, if it doesn't
 */
export class UserConfigUtils {

  /**
   * Reads user config
   * 
   * @returns user config as a JSON object that has an interface
   */
  static async readUserConfig() : Promise<UserConfigJson> {
    try {
      await this.checkUserConfig();

      const data = fs.readFileSync(userConfigPath, "utf8");
      return await JSON.parse(data.toString());
    } catch(err) {
      throw new Error ("Error while reading user-config: " + err);
    }
  }

  /**
   * Writes to user config
   * 
   * @param data should receive the edited version of user-config.json 
   */
  static async writeUserConfig(data : string) : Promise<void> {
    try {
      await this.checkUserConfig();

      fs.writeFileSync(userConfigPath, data, "utf8");
    } catch (err) {
      throw new Error("Error when attempting to write to user-config:" + err);
    }
  }

  /**
   * Checks if user-config.json exists in the root and creates it from template if it doesn't
   */
  private static async checkUserConfig() : Promise<void> {
    try {
      if (!fs.existsSync(userConfigPath)) {
        const data = fs.readFileSync(userConfigTemplate, "utf8");
        fs.writeFileSync(userConfigPath, data);
      }
    } catch (err) {
      throw new Error("Error when attempting to create user-config:" + err);
    }
  }
}
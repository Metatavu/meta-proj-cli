import fs from "fs";
import { ProjConfigJson } from "../interfaces/types";
import path from "path";

const configFileName = "project-config.json";
const projConfigTemplate = `.${path.sep}resources${path.sep}project-config-template.json`;

export class ProjConfigUtils {

  /**
   * Reads project-config.json from given path
   * 
   * @param outerFolder outer folder of the project (check path-utils for more info)
   * 
   * @returns project config as a JSON object that has an interface.
   */
    static async readProjConfig(outerFolder : string) : Promise<ProjConfigJson> {
    try {
      await this.checkProjConfig(outerFolder);

      const data = fs.readFileSync(this.outerToFile(outerFolder), "utf8");
      return await JSON.parse(data.toString());
    } catch(err) {
      throw new Error ("Error while reading project-config: " + err);
    }
  }

  /**
   * Writes to project-config.json
   * 
   * @param path outer folder of the project (check path-utils for more info)
   * 
   * @param data should receive the edited version of project-config.json 
   */
  static async writeProjConfig(outerFolder : string, data : string) : Promise<void> {
    try {
      await this.checkProjConfig(outerFolder);

      fs.writeFileSync(this.outerToFile(outerFolder), data, "utf8");
    } catch (err) {
      throw new Error("Error when attempting to write to user-config:" + err);
    }
  }

  /**
   * creates project-config.json from template to given folder
   * 
   * @param outerFolder foldern in which project-config.json should be created to
   */
  static async createProjectConfig(outerFolder : string) : Promise<void> {
    try {
      const data = fs.readFileSync(projConfigTemplate, "utf8");
      fs.writeFileSync(this.outerToFile(outerFolder), data);
    } catch (err) {
      throw new Error("Error when attempting to create user-config:" + err);
    }
  }

  /**
   * Checks if user-config.json exists in the root and creates it from template if it doesn't
   * 
   * @param outerFolder the path to project-config.json of the project
   */
  private static async checkProjConfig(outerFolder : string) : Promise<void> {
    try {
      if (!fs.existsSync(this.outerToFile(outerFolder))) {
        this.createProjectConfig(outerFolder); 
      }
    } catch (err) {
      throw new Error("Error when attempting to create user-config:" + err);
    }
  }

  /**
   * gives the path to project-config.json inside a project folder
   * 
   * @param outerFolder outer folder of project (check path-utils for more info)
   */
  private static outerToFile(outerFolder : string) : string {
    return path.join(outerFolder, configFileName);
  }
}
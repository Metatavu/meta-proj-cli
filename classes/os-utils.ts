import { OsCommand, CommandObj, UserConfigJson, OperatingSystems } from "../interfaces/types";
import { OsCommands } from "./os-commands";
import fs from "fs";

const systems : string[]  = [OperatingSystems.MAC, OperatingSystems.WINDOWS, OperatingSystems.LINUX];

/**
 * Enables cross-platform support
 */
export default class OsUtils {

  /**
   * Getter for commands
   * 
   * @param cmd refers to command name that is being searched
   * 
   * @returns either corresponding command or an error
   */
  static getCommand = async (cmd: string): Promise<string> => {
    try {
      const userConfig: UserConfigJson = await OsUtils.readUserConfig();
      const command : CommandObj = OsUtils.searchCmd(userConfig.osPref, cmd);
      return command.command;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Getter for current user selected OS
   * 
   * @returns the selected OS if any
   */
  public static getOS = async () : Promise<string | null> => {
    try {
      const os : UserConfigJson = await OsUtils.readUserConfig();
      return os?.osPref || null; 
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Setter for user selected OS
   * 
   * @param os is the OS that is being switched to, if supported
   */
  public static setOS = async (os : string) => {
    if (systems.includes(os.toUpperCase())) {
      OsUtils.swapOs(os);
    } else {
      throw new Error("This operating system is not supported.");
    }
  }

    /**
   * Re-writes user config using previous user config as basis
   * 
   * @param os is the OS that is being switched to, if supported
   */
  private static async swapOs (os : string) {
    const userConfig : UserConfigJson = await OsUtils.readUserConfig();
    userConfig.osPref = os;
    const data = JSON.stringify(userConfig, null, 2);

    try {
      fs.writeFile("./user-config.json", data, "utf8", (err) => {
        if (err) {
          throw new Error("Error when attempting to write file:" + err);
        }
      });
    } catch(err) {
      throw err;
    }
  }

  /**
   * Reads user config
   * 
   * @returns user config as a JSON object that has an interface
   */
  private static async readUserConfig() : Promise<UserConfigJson> {
    try {
      const data = fs.readFileSync("./user-config.json", "utf8");
      return JSON.parse(data.toString());
    } catch(err) {
      throw new Error ("User config not found: " + err);
    }
  }

  /**
   * Searches the corresponding command for the corresponding OS
   * 
   * @param os is the OS that is currently being used
   * 
   * @param command is the command's name that is being searched
   * 
   * @returns Command Object which matches with the user OS and the searched command
   */
  private static searchCmd (os: string, command: string) {
    return OsCommands.getCmds()
      .filter(item => item.OS == os)
      .flatMap(item => item.commands)
      .find(item => item.name === command);
  }
}

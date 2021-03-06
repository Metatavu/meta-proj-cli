import { UserConfigJson, OperatingSystems } from "../interfaces/types";
import { OsCommands } from "./os-commands";
import { UserConfigUtils } from "./user-config-utils";
import { windows, linux, linuxBased, macos } from "platform-detect";

const systems: string[]  = [ OperatingSystems.MAC, OperatingSystems.WINDOWS, OperatingSystems.LINUX ];

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
  static getCommand = async (cmd: string): Promise<string | null> => {
    try {
      const userConfig: UserConfigJson = await UserConfigUtils.readUserConfig();
      const command: string = await OsUtils.searchCmd(userConfig.osPref, cmd);
      if(command){
        return command;
      } else {
        return null;
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Getter for current user selected OS
   * 
   * @returns the selected OS if any
   */
  public static getOS = async (): Promise<string | null> => {
    try {
      const os: UserConfigJson = await UserConfigUtils.readUserConfig();
      return os?.osPref || null; 
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Setter for user selected OS
   * 
   * @param os is the OS that is being switched to, if supported
   */
  public static setOS = async (os: string): Promise<void> => {
    if (systems.includes(os.toUpperCase())) {
      OsUtils.swapOs(os);
    } else {
      throw new Error("This operating system is not supported.");
    }
  }

  /**
   * Enables estimating the used OS on startup and notifies user
   * 
   * @returns estimated OS in use
   */
  public static detectOS = (): string => {
    let detectedOS: string;
    if (windows) {
      detectedOS = "WINDOWS";
    }
    else if (macos) {
      detectedOS = "MAC OS";
    }
    else if (linux || linuxBased) {
      detectedOS = "LINUX";
    } else {
      console.log("It looks like you aren't running any of the supported platforms. Proceeding with selected OS...");
    }
    console.log(`It seems like you're using ${detectedOS}. If this is incorrect, please use "select-os" to switch it.`);
    return detectedOS
  }

    /**
   * Re-writes user config using previous user config as basis
   * 
   * @param os is the OS that is being switched to, if supported
   */
  private static async swapOs (os: string) {
    const userConfig: UserConfigJson = await UserConfigUtils.readUserConfig();
    userConfig.osPref = os;
    const data = JSON.stringify(userConfig, null, 2);
    await UserConfigUtils.writeUserConfig(data);
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
  private static async searchCmd (os: string, command: string): Promise<string | null> {
    try{
      const osCommands = await OsCommands.getCmds();
      if (osCommands) {
        return osCommands
        .filter(item => item.OS == os)
        .flatMap(item => item.commands)
        .find(item => item.name == command).command;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error("Failing to retrieve command:" + err);
    }
  }
}

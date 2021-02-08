import { OsCommand, CommandObj, UserConfigJson } from "../interfaces/types";
import { OsCommands } from "./os-commands";
import fs from "fs";

const systems : string[]  = ["MAC OS", "WINDOWS", "LINUX"];

/**
 * Enables cross-platform support
 * 
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
      const userConfig: UserConfigJson = await helperFunctions.readUserConfig();
      return helperFunctions.searchCmd(userConfig.osPref, cmd);
    } catch (err) {
      return Promise.reject(err);
    };
  };

  /**
   * Getter for current user selected OS
   * 
   * @returns the selected OS if any
   */
  static getOS = async () : Promise<string> => {
    let os : string = null;
    await helperFunctions.readUserConfig().then((userConfig : UserConfigJson) => {
      os = userConfig.osPref;
      return os;
    }).catch((err) => {
      throw err;
    });
    if (!os) {
      return null;
    };
  };

  /**
   * Setter for user selected OS
   * 
   * @param os is the OS that is being switched to, if supported
   */
  static setOS = async (os : string) => {
    if (systems.includes(os.toUpperCase())) {
      helperFunctions.swapOs(os);

    } else {
      throw new Error("This operating system is not supported.");
    };
  };
};

/**
 * Functionalities that are used in the exported class above
 */
module helperFunctions {

    /**
   * Re-writes user config using previous user config as basis
   * 
   * @param os is the OS that is being switched to, if supported
   */
  export async function swapOs (os : string) {
    await readUserConfig().then((userConfig) => {
      userConfig.osPref = os;
      let data = JSON.stringify(userConfig, null, 2);

    try{
      fs.writeFile("./user-config.json", data, "utf8", (err) => {
        if(err){
          throw new Error("Error when attempting to write file:" + err);
        }
      });
    } catch(err) {
      throw err;
    };
    });
  };

  /**
   * Reads user config
   * 
   * @returns user config as a JSON object that has an interface
   */
  export async function readUserConfig() : Promise<UserConfigJson> {
    let dataJson : UserConfigJson = null;
    try{
      let data = fs.readFileSync("./user-config.json", "utf8");
      dataJson = JSON.parse(data.toString());
      return dataJson;
      
    } catch(err) {
      throw new Error ("User config not found: " + err);
    };
  };

  /**
   * Searches the corresponding command for the corresponding OS
   * 
   * @param os is the OS that is currently being used
   * 
   * @param command is the command's name that is being searched
   */
  export function searchCmd (os : string, command : string) {
    let osCommands : OsCommand[] = OsCommands.getCmds();
    let found : boolean = false;
    for (let i=0; i<osCommands.length; i++) {

      if (osCommands[i].OS == os) {

        for (let j=0; j<osCommands[i].commands.length; j++) {

          if (osCommands[i].commands[j].name == command) {

            found = true;
            return osCommands[i].commands[j].command;
          }
        }
      }
    }
    if (!found){
      return null;
    }
  }
}

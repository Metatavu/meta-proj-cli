import { OsCommand, Command } from "../interfaces/cmd-command";
import { OsCommands } from "./os-commands";
import fs from "fs";
import { UserConfigJson } from "../interfaces/user-config";

const systems : string[]  = ["MAC OS", "WINDOWS", "LINUX"];

/**
 * Enables cross-platform support
 * 
 * getCommand = getter for commands
 * getOS = getter for current user selected OS 
 * setOS = setter for user selected OS
 * 
 * swapOs = provides functionality for setOS
 * readUserConfig = provides functionality for getOS and setOS
 * searchCmd = provides functionality for getCommand
 */
export class OsUtils {

  static getCommand = async (cmd : string) : Promise<string> => {
    let command : string = null;
    let os : string = null;
    await readUserConfig().then((userConfig : UserConfigJson) => {
      try {
        os = userConfig.osPref;
        command = searchCmd(os, cmd);
        return command;
      } catch (err) {
        throw err;
      };
    }).catch((err) => {
      throw new Error("Fetching command failed: " + err);
    });
    if (!command) {
      return null;
    };
  };
  
  static getOS = async () : Promise<string> => {
    let os : string = null;
    await readUserConfig().then((userConfig : UserConfigJson) => {
      os = userConfig.osPref;
      return os;
    }).catch((err) => {
      throw err;
    });
    if (!os) {
      return null;
    };
  };

  static setOS = async (os : string) => {
    if (systems.includes(os.toUpperCase())) {
      swapOs(os);
    } else {
      throw new Error("This operating system is not supported.");
    };
  };
};

async function swapOs (os : string) {
  await readUserConfig().then((userConfig) => {
    userConfig.osPref = os;
    let data = JSON.stringify(userConfig, null, 2);
  try{
    fs.writeFile("./user-config.json", data, "utf8", (err) => {
      if(err){
        throw new Error("Error when attempting to write file:" + err);
      };
    });
  } catch(err) {
    throw err;
  };
  });
};

async function readUserConfig() : Promise<UserConfigJson> {
  let dataJson : UserConfigJson = null;
  try{
    let data = fs.readFileSync("./user-config.json", "utf8");
    dataJson = JSON.parse(data.toString());
    return dataJson;
    
  } catch(err) {
    throw new Error ("User config not found: " + err);
  };
};

function searchCmd (os : string, command? : string) {
  let osCommands : OsCommand[] = OsCommands.getCmds();
  let found : boolean = false;
  for (let i=0; i<osCommands.length; i++) {
    if (osCommands[i].OS == os) {
      for (let j=0; j<osCommands[i].commands.length; j++) {
        if (osCommands[i].commands[j].name == command) {
          found = true;
          return osCommands[i].commands[j].command;
        };
      };
    };
  };
  if (!found){
    return null;
  };
};

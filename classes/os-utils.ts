import { OsCommand } from "../interfaces/cmd-command";
import { OsCommads } from "./os-commands";
import { execSync } from "child_process";

let os : string = "LINUX";
let activeCmds : OsCommand = null;
const systems : string[]  = ["MAC OS", "WINDOWS", "LINUX"];

/**
 * Enables cross-platform support
 * 
 */
export class OsUtils {
  static getActiveCmds : OsCommand = activeCmds;

  static setActiveCmds = (cmds : OsCommand) => {
    activeCmds = cmds;
  }

  static getOS : string = os;

  static setOS = (userInput : string) => {
    if (systems.includes(userInput.toUpperCase())) {
      os = userInput.toUpperCase();
      let osCommands : OsCommand[] = OsCommads.getCmds();
      for (let i=0; i<osCommands.length; i++){
        if (osCommands[i].OS == os) {
          activeCmds = osCommands[i]; 
        };
      };
    } else {
      throw new Error("This operating system is not supported.");
    }
  }

  static osPrompt = () => {
    execSync("os-selection");
  }
}

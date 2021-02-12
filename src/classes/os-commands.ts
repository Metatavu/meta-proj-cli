import { OsCommand, OperatingSystems, CommandNames } from "../interfaces/types";

const cmds : OsCommand[] = [
  {
    OS : OperatingSystems.WINDOWS,
    commands: [
      { name : CommandNames.copy, command : "copy" },
      { name : CommandNames.remove, command : "del /f /q" },
      { name : CommandNames.removeDir, command : "rmdir /s /q" },
      { name : CommandNames.installUtil, command : "choco" }
    ] 
  },
  {
    OS : OperatingSystems.LINUX,
    commands: [
      { name : CommandNames.copy, command : "cp" },
      { name : CommandNames.remove, command : "rm -f" },
      { name : CommandNames.removeDir, command : "rm -rf" },
      { name : CommandNames.installUtil, command : "sudo apt" }
    ] 
  },
  {
    OS : OperatingSystems.MAC,
    commands: [
      { name : CommandNames.copy, command : "cp" },
      { name : CommandNames.remove, command : "rm -f" },
      { name : CommandNames.removeDir, command : "rm -rf" },
      { name : CommandNames.installUtil, command : "brew" }
    ] 
  }
];

/**
 * Provides operation system-specific commands for os-utils
 */
export class OsCommands {
  static getCmds = async () : Promise<OsCommand[]> => {
    return cmds;
  }
}

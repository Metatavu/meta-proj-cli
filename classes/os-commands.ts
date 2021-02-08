import { OsCommand, OperatingSystems, CommandNames } from "../interfaces/types";

const cmds : OsCommand[] = [
  {
    OS : OperatingSystems.WINDOWS,
    commands: [
      { name : CommandNames.copy, command : "copy" },
      { name : CommandNames.remove, command : "del /f /q" },
      { name : CommandNames.removeDir, command : "rmdir /s /q" }
    ] 
  },
  {
    OS : OperatingSystems.LINUX,
    commands: [
      { name : CommandNames.copy, command : "cp" },
      { name : CommandNames.remove, command : "rm -f" },
      { name : CommandNames.removeDir, command : "rm -rf" }
    ] 
  },
  {
    OS : OperatingSystems.MAC,
    commands: [
      { name : CommandNames.copy, command : "cp" },
      { name : CommandNames.remove, command : "rm -f" },
      { name : CommandNames.removeDir, command : "rm -rf" }
    ] 
  }
];

/**
 * Provides operation system-specific commands for os-utils
 */
export class OsCommands {
  static getCmds = () : OsCommand[] => {
    return cmds;
  }
}

import { OsCommand, OperatingSystems, CommandNames } from "../interfaces/types";

const cmds : OsCommand[] = [
  {
    OS : OperatingSystems.WINDOWS,
    commands: [
      { name : CommandNames.copy, command : "copy" }
    ] 
  },
  {
    OS : OperatingSystems.LINUX,
    commands: [
      { name : CommandNames.copy, command : "cp" }
    ] 
  },
  {
    OS : OperatingSystems.MAC,
    commands: [
      { name : CommandNames.copy, command : "cp" }
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
};

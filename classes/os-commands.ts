import { OsCommand } from "../interfaces/cmd-command";

const cmds : OsCommand[] = [
  {
    OS : "WINDOWS",
    commands: [
      { name : "copy", command : "copy" }
    ] 
  },
  {
    OS : "LINUX",
    commands: [
      { name : "copy", command : "cp" }
    ] 
  },
  {
    OS : "MAC OS",
    commands: [
      { name : "copy", command : "cp" }
    ] 
  }
];

export class OsCommands {
  static getCmds = () : OsCommand[] => {
    return cmds;
  }
};

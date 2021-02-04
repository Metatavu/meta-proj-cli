import { OsCommand } from "../interfaces/cmd-command";

const cmds : OsCommand[] = [
{
  OS : "WINDOWS",
  copy : "copy"
},
{
  OS : "LINUX",
  copy : "cp"
},
{
  OS : "MAC OS",
  copy : "cp"
}];

export class OsCommads {
  static getCmds = () : OsCommand[] => {
    return cmds;
  }
}
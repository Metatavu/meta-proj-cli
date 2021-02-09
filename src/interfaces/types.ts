import Vorpal, { Command } from "vorpal";

/**
 * Helps with grouping commands without needing a new .use.execSync for each of them
 * 
 * use : intended to hold imported contents of command
 * command : string used to call the command in question
 */
export interface CommandSet {
  use : (Vorpal) => Command,
  command : string
}

/**
 * Used to store and transmit data about the outcome of a prerequisite check
 * 
 * checkable : name of the prerequisite that was checked\
 * error : did an error occur or not\
 * details : possible extra details about the error
 */
export interface CheckErrorSet {
  check : string,
  error : boolean,
  details : string
}

/**
 * Provides the name and possible details to a prerequisite checking function
 * 
 * checkable : name of the prerequisite to check\
 * details : possible extra details needed for the check
 */
export interface CheckSet {
  checkable : string,
  details : {}
}

/**
 * OS and its corresponding commands
 * 
 * OS : operating system
 * commands : an array that contains the commands
 */
export interface OsCommand {
  OS : string,
  commands : CommandObj[]
}

/**
 * Command that is used in bash
 * 
 * name : command key that is used when searching for command
 * command : command value that is OS-dependent
 */
export interface CommandObj {
  name : string
  command : string
}

/**
 * Interface for user-config file to not run into errors
 * 
 * osPref : user preferred OS
 */
export interface UserConfigJson {
  osPref : string
}

/**
 * Global constants for OS names
 */
export enum OperatingSystems {
  LINUX = "LINUX",
  WINDOWS = "WINDOWS",
  MAC = "MAC OS"
}

/**
 * Global constants for command names
 */
export enum CommandNames {
  copy = "copy",
  remove = "remove",
  removeDir = "remove directory"
}
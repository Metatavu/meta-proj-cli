/**
 * Helps with grouping commands without needing a new .use.execSync for each of them
 * 
 * use : intended to hold imported contents of command
 * command : string used to call the command in question
 */
export interface CommandSet {
  use : any,
  command : string
}
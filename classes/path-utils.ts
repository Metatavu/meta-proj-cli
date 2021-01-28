import * as path from "path";

const { HOME } = process.env;

/**
 * Offers functions that help with paths
 * 
 * fixPath : changes file separators to platform specific ones and expands tilde(~) paths
 */
export class PathUtils {
  static fixPath = (givenPath : string) => {
    givenPath = path.join(...givenPath.split(/\/|\\/));
  
    if (givenPath[0] === "~") {
      givenPath = path.join(HOME, givenPath.slice(1))
    } 
  
    if (givenPath[0] !== "/") {
      givenPath = path.sep + givenPath;
    } 
  
    return givenPath;
  }
}
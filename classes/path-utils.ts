import * as path from "path";

const { HOME } = process.env;

/**
 * Offers functions that help with paths
 * 
 * fixPath : changes file separators to platform specific ones and expands tilde(~) paths
 * outerFolder : gives the path format to the outer folder of a project
 * repoFolder : gives the path format to the folder that actually holds the project (contains .git)
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
  static outerFolder = (givenPath : string, repoName : string) => {
    return path.join(givenPath, repoName + "-project");
  }

  static repoFolder = (givenPath : string, repoName : string) => {
    return path.join(givenPath, repoName + "-project", repoName);
  }
}
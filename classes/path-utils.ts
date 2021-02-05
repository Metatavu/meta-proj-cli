import * as path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { OsUtils } from "../classes/os-utils";

const { HOME } = process.env;
const defaultSavePath : string = "~/.meta-proj-cli/";
const defaultProjectPath : string = "~/.meta-proj-cli/projects";

/**
 * Offers functions that help with paths
 * 
 * fixPath : changes file separators to platform specific ones and expands tilde(~) paths
 * outerFolder : gives the path format to the outer folder of a project
 * repoFolder : gives the path format to the folder that actually holds the project (contains .git)
 */
export class PathUtils {
  static savePath : string = pathFixer(defaultSavePath);

  static projectPath : string = pathFixer(defaultProjectPath);

  static fixPath = (givenPath : string) => { 
    return pathFixer(givenPath);
  }

  static outerFolder = (givenPath : string, repoName : string) => {
    return path.join(givenPath, repoName + "-project");
  }

  static repoFolder = (givenPath : string, repoName : string) => {
    return path.join(givenPath, repoName + "-project", repoName);
  }

  static checkExists = async (givenPath : string) => {
    try {
      let activeOs = null;
      OsUtils.getOS().then((os) => {
          activeOs = os;
      }).catch((err) => {
        if (err) {
          throw err;
        }
      });
      if(activeOs){
        givenPath = pathFixer(givenPath, activeOs);
      } else {
        givenPath = pathFixer(givenPath);
      };
      if (!fs.existsSync(givenPath)) {
        execSync(`mkdir ${givenPath}`);
      };
    } catch(err) {
      throw new Error(`Error when checking or creating path: ${err}`);
    };
  };
};

/**
 * Provides cross-platform functionality & tilde expansion when working with paths
 * @param givenPath path that is to be sanitized
 */

function pathFixer(givenPath : string, os? : string) {
  if (!os) {
    os = "LINUX";
  };
  if (os === "LINUX" || os === "MAC OS") {
    if (givenPath[0] === "~") {
      givenPath = path.join(HOME, givenPath.slice(1))
    };
    if (givenPath[0] === "/") {
      givenPath = path.join(...givenPath.split(/\/|\\/));
      givenPath = path.sep + givenPath;
    };
  };
  if ( os === "WINDOWS") {
    if (givenPath.match(/^([C-Z]:)/)) {
      givenPath = path.join(...givenPath.split(/\/|\\/));
    };
  };
  return givenPath;
};

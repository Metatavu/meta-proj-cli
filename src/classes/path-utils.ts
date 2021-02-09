import * as path from "path";
import fs from "fs";
import { execSync } from "child_process";
import OsUtils from "../classes/os-utils";
import { OperatingSystems } from "../interfaces/types";

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

  public static savePath = () : string => {
    return PathUtils.translatePath(defaultSavePath);
  }

  public static projectPath = () : string => {
    return PathUtils.translatePath(defaultProjectPath);
  }

  public static fixPath = (givenPath : string) : string => { 
    return PathUtils.translatePath(givenPath);
  }

  public static outerFolder = (givenPath : string, repoName : string) : string => {
    return path.join(givenPath, repoName + "-project");
  }

  public static repoFolder = (givenPath : string, repoName : string) : string => {
    return path.join(givenPath, repoName + "-project", repoName);
  }

  public static checkExists = async (givenPath : string) : Promise<void> => {
    try {
      const activeOs = await OsUtils.getOS();
      givenPath = activeOs ? PathUtils.translatePath(givenPath, activeOs) : PathUtils.translatePath(givenPath);

      if (!fs.existsSync(givenPath)) {
        execSync(`mkdir ${givenPath}`);
      }
    } catch(err) {
      throw new Error(`Error when checking or creating path: ${err}`);
    }
  }

  /**
 * Provides cross-platform functionality & tilde expansion when working with paths
 * 
 * @param givenPath path that is to be sanitized
 * 
 * @param os is the OS that is currently being used
 */
  private static translatePath(givenPath : string, os? : string) {
    if (!os) {
      os = OperatingSystems.LINUX;
    }
  
    if (os === OperatingSystems.LINUX || os === OperatingSystems.MAC) {
      if (givenPath[0] === "~") {
        givenPath = path.join(HOME, givenPath.slice(1));
      }
      if (givenPath[0] === "/") {
        givenPath = path.join(...givenPath.split(/\/|\\/));
        givenPath = path.sep + givenPath;
      }
    }
  
    if (os === OperatingSystems.WINDOWS) {
      if (givenPath.match(/^([C-Z]:)/)) {
        givenPath = path.join(...givenPath.split(/\/|\\/));
      }
    } else {
      givenPath = path.join(...givenPath.split(/\/|\\/));
      givenPath = path.sep + givenPath;
    }
  
    return givenPath;
  }
}
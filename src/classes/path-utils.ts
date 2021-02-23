import * as path from "path";
import fs from "fs";
import OsUtils from "../classes/os-utils";
import { OperatingSystems } from "../interfaces/types";
import { runExecSync } from "../classes/exec-sync-utils";

const { HOME } = process.env;
const defaultSavePath = "~/.meta-proj-cli/";
const defaultProjectPath = "~/.meta-proj-cli/projects";

/**
 * Offers functions that help with paths
 * 
 * fixPath : changes file separators to platform specific ones and expands tilde(~) paths
 * outerFolder : gives the path format to the outer folder of a project
 * repoFolder : gives the path format to the folder that actually holds the project (contains .git)
 */
export class PathUtils {

  public static savePath = async () : Promise<string> => {
    const os : string = await PathUtils.osResolver();
    return await PathUtils.translatePath(defaultSavePath, os);
  }

  public static projectPath = async () : Promise<string> => {
    const os : string = await PathUtils.osResolver();
    return  await PathUtils.translatePath(defaultProjectPath, os);
  }

  public static fixPath = async (givenPath : string) : Promise<string> => { 
    const os : string = await PathUtils.osResolver();
    return await PathUtils.translatePath(givenPath, os);
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
      givenPath = await PathUtils.translatePath(givenPath, activeOs);
      if (!fs.existsSync(givenPath)) {
        await runExecSync(`mkdir ${givenPath}`);
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
  private static async translatePath(givenPath : string, os : string) {
    if (!os) {
      os = await OsUtils.getOS();
    }

    try {
      if (os == OperatingSystems.LINUX || os == OperatingSystems.MAC) {
        if (givenPath[0] === "~") {
          givenPath = path.join(HOME, givenPath.slice(1));
        }
        if (givenPath[0] === "/") {
          givenPath = path.join(...givenPath.split(/\/|\\/));
          givenPath = path.sep + givenPath;
        }
      }
      else if (os == OperatingSystems.WINDOWS) {
        if (givenPath[0] === "~") {
          givenPath = path.join(HOME, givenPath.slice(1));
        }
        if (givenPath.match(/^([C-Z]:)/)) {
          givenPath = path.join(...givenPath.split(/\/|\\/));
        }
      } else {
        if (givenPath[0] === "~") {
          givenPath = path.join(HOME, givenPath.slice(1));
        }
        if (givenPath[0] === "/") {
          givenPath = path.join(...givenPath.split(/\/|\\/));
          givenPath = path.sep + givenPath;
        }
      }
    } catch (err) {
      throw new Error("Error when translating path: " + err);
    }
    return givenPath;
  }

  /**
   * Helper function for above functions to resolve user OS in question
   * 
   * @returns user preferred OS if any, or detected OS
   */
  private static async osResolver() : Promise<string> {
    let os : string = await OsUtils.getOS();
    if(!os){
      os = OsUtils.detectOS();
    }
    return os;
  }
}

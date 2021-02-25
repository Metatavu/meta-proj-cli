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
 */
export class PathUtils {

  /**
   * Provides platform specific root folder for projects
   * 
   * @returns root folder path for new projects
   */
  public static savePath = async (): Promise<string> => {
    const os: string = await PathUtils.osResolver();
    return await PathUtils.translatePath(defaultSavePath, os);
  }

  /**
   * Provides platform specific path where to init new projects
   * 
   * @returns default projects folder path where to init new projects
   */
  public static projectPath = async (): Promise<string> => {
    const os: string = await PathUtils.osResolver();
    return await PathUtils.translatePath(defaultProjectPath, os);
  }

/**
 * Changes file separators to platform specific ones and expands tilde(~) paths
 * 
 * @param givenPath path that is being fixed
 * @returns platform specific path
 */
  public static fixPath = async (givenPath: string): Promise<string> => { 
    const os: string = await PathUtils.osResolver();
    return await PathUtils.translatePath(givenPath, os);
  }

  /**
   * Gives the path format to the outer folder of a project
   * 
   * @param givenPath path where project is being initialised to
   * @param repoName project folder name
   * @returns path to outer folder of the project
   */
  public static outerFolder = (givenPath: string, repoName: string): string => {
    return path.join(givenPath, repoName + "-project");
  }

  /**
   * Gives the path format to the folder that actually holds the project (contains .git)
   * 
   * @param givenPath path where project is being initialised to
   * @param repoName project folder name
   * @returns path to inner folder of the project
   */
  public static repoFolder = (givenPath: string, repoName: string): string => {
    return path.join(givenPath, repoName + "-project", repoName);
  }

  /**
   * Checks is a folder path in question exists or not and creates it in case it doesn't exist
   * 
   * @param givenPath the path whose existence is being checked
   */
  public static checkExists = async (givenPath: string): Promise<void> => {
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
 * @param os is the OS that is currently being used
 * @returns translated platform specific path
 */
  private static async translatePath(givenPath: string, os: string) {
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
    
      if (os == OperatingSystems.WINDOWS) {
        if (givenPath[0] === "~") {
          givenPath = path.join(HOME, givenPath.slice(1));
        }
        if (givenPath.match(/^([C-Z]:)/)) {
          givenPath = path.join(...givenPath.split(/\/|\\/));
        }
      } else {
        console.log("It looks like you aren't running any of the supported platforms. Proceeding with Unix-base as a default...");
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
  private static async osResolver(): Promise<string> {
    let os: string = await OsUtils.getOS();
    if(!os){
      os = OsUtils.detectOS();
    }
    return os;
  }
}

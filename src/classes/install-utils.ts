import { execSync } from "child_process";
import OsUtils from "./os-utils"
import { OperatingSystems, CommandNames } from "../interfaces/types";
import { InstallSwRefs } from "./install-sw-refs";

export class InstallUtils {

  /**
   * Installs Homebrew for MAC OS users
   */
  public static async installBrew() : Promise<void> {
    const os : string = await OsUtils.getOS();
    if (os == OperatingSystems.MAC){
      try {
        execSync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
      } catch (err) {
        throw new Error("Error during Homebrew installation: " + err);
      }
    }
  }

  /**
   * Installs different software using bash and the referred utility
   * 
   * @param software is the desired software to be installed
   */
  public static async installSW(software : string) : Promise<void> {
    const installUtil : string = await OsUtils.getCommand(CommandNames.installUtil);
    const installRef : string = await InstallSwRefs.getInstallRef(installUtil, software);
    if (installUtil == "brew") {
      const status : boolean = await this.isInstalled(installUtil);
      if (!status) {
        await this.installBrew();
      }
    }
    try {
      execSync(`${installUtil} install ${installRef}`);
    } catch (err) {
      throw new Error(`Error during ${software} installation: ${err}`);
    }
  }

  /**
   * Attempts to confirm a software's installation status
   * 
   * @param software is the software that is being checked
   * 
   * @returns a boolean that indicates if a software has already been installed
   */
  public static async isInstalled(software : string) : Promise<boolean> {
    let result : string;
    software = await InstallSwRefs.getBashRef(software);
    if(software == "brew"){
      try {
        result = execSync(`which ${software}`).toString();
      } catch (err) {
        throw new Error(`Error when checking software ${software}: ${err}`);
      }
      
      if(result.search(/not found/) == -1) {
        return true;
      } else {
        return false;
      }
    } else {
      try {
        result = execSync(`${software} --version`).toString();
      } catch (err) {
        throw new Error(`Error when checking software ${software}: ${err}`);
      }
      
      if(result.search(/is not recognized/) == -1) {
        return true;
      } else {
        return false;
      }
    }
  }
}
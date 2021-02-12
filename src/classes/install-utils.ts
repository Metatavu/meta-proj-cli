import { execSync } from "child_process";
import OsUtils from "./os-utils"
import { OperatingSystems, CommandNames } from "../interfaces/types";
import { InstallSwRefs } from "./install-sw-refs";

export class InstallUtils {

  /**
   * Install Homebrew command for MAC OS users
   * 
   * @returns Homebrew installation command that is run by the wizard
   */
  public static async installBrew() : Promise<string> {
    const os : string = await OsUtils.getOS();
    if (os == OperatingSystems.MAC){
      return '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
    }
  }

  /**
   * Install software command for bash
   * 
   * @param software is the desired software to be installed
   * 
   * @returns software installation command that is run by the wizard
   */
  public static async installSW(software : string) : Promise<string> {
    const installUtil : string = await OsUtils.getCommand(CommandNames.installUtil);
    const installRef : string = await InstallSwRefs.getInstallRef(installUtil, software);

    return `${installUtil} install ${installRef}`;
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
      return (result.search(/not found/) == -1);

    } else {
      try {
        result = execSync(`${software} --version`).toString();
      } catch (err) {
        throw new Error(`Error when checking software ${software}: ${err}`);
      }
      return (result.search(/is not recognized/) == -1);
    }
  }
}
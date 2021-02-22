import { execSync } from "child_process";
import OsUtils from "./os-utils"
import { OperatingSystems, CommandNames, Software } from "../interfaces/types";
import { InstallSwRefs } from "./install-sw-refs";

/**
 * Provides installation utilities for installation command
 */
export class InstallUtils {

  /**
   * Install Homebrew command for MAC OS users
   * 
   * @returns Homebrew installation command that is run by the wizard
   */
  public static async installBrew(): Promise<string> {
    const os: string = await OsUtils.getOS();

    if (os == OperatingSystems.MAC){
      return '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
    }
  }

  /**
   * Install Minikube command
   * 
   * @returns Array of installation commands that are run by the wizard
   */
  public static async installKube(): Promise<string[]> {
    const installUtil: string = await OsUtils.getCommand(CommandNames.installUtil);
    const installRef: string = await InstallSwRefs.getInstallRef(installUtil, Software.Minikube);
    const cmds : string[] = [];

    if (installUtil == "sudo apt") {
      cmds.push("wget https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64");
      cmds.push("sudo cp minikube-linux-amd64 /usr/local/bin/minikube");
      cmds.push("sudo chmod 755 /usr/local/bin/minikube");
    } else {
      cmds.push(`${installUtil} install ${installRef}`);
    }
    return cmds;
  }

  /**
   * Install Kubernetes CLI command
   * 
   * @returns Array of installation commands that are run by the wizard
   */
  public static async installKubeCtl(): Promise<string[]> {
    const installUtil: string = await OsUtils.getCommand(CommandNames.installUtil);
    const installRef: string = await InstallSwRefs.getInstallRef(installUtil, Software.Minikube);
    const cmds : string[] = [];

    if (installUtil == "sudo apt") {
      cmds.push("curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl");
      cmds.push("chmod +x ./kubectl");
      cmds.push("sudo mv ./kubectl /usr/local/bin/kubectl");
    } else {
      cmds.push(`${installUtil} install ${installRef}`);
    }
    return cmds;
  }

  /**
   * Install software command for bash
   * 
   * @param software is the desired software to be installed
   * @returns software installation command that is run by the wizard
   */
  public static async installSW(software: string): Promise<string> {
    const installUtil: string = await OsUtils.getCommand(CommandNames.installUtil);
    const installRef: string = await InstallSwRefs.getInstallRef(installUtil, software);

    return (software == Software.Kustomize) ? installRef : `${installUtil} install ${installRef}`;
  }

  /**
   * Attempts to confirm a software's installation status
   * 
   * @param software is the software that is being checked
   * @returns a boolean that indicates if a software has already been installed
   */
  public static async isInstalled(software : string) : Promise<boolean> {
    const bashRef = await InstallSwRefs.getBashRef(software);

    if(bashRef == "brew"){
      try {
        const str = `which ${bashRef}`;
        const result = execSync(str).toString();
        return (result.search(/not found/) == -1);

      } catch (err) {
        throw new Error(`Error when checking software ${software}: ${err}`);
      }

    } else {
      try {
        const str = `${bashRef} --version`;
        const result = execSync(str).toString();
        return (result.search(/is not recognized/) == -1);
      } catch (err) {
        throw new Error(`Error when checking software ${software}: ${err}`);
      }
    }
  }
}

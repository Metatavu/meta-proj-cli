import OsUtils from "./os-utils"
import { OperatingSystems, CommandNames, Software } from "../interfaces/types";
import { InstallSwRefs } from "./install-sw-refs";
import { runExecSync } from "../classes/exec-sync-utils";

/**
 * Provides installation utilities for installation command
 */
export class InstallUtils {

  /**
   * Install Homebrew command for MAC OS users
   * 
   * @returns Homebrew installation command that is run by the wizard
   */
  public static async installBrew(): Promise<string | null> {
    const os: string = await OsUtils.getOS();

    return (os == OperatingSystems.MAC) ? '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    : null;
  }

  /**
   * Install Minikube command
   * 
   * @returns Array of installation commands that are run by the wizard
   */
  public static async installKube(): Promise<string[]> {
    const installUtil: string = await OsUtils.getCommand(CommandNames.installUtil);
    const installRef: string = await InstallSwRefs.getInstallRef(installUtil, Software.Minikube);
    const cmds: string[] = [];

    if (installUtil == "sudo apt") {
      cmds.push("wget https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64");
      cmds.push("sudo cp minikube-linux-amd64 /usr/local/bin/minikube");
      cmds.push("sudo chmod 755 /usr/local/bin/minikube");
    } else {
      cmds.push(this.chocoOrBrew(installUtil, installRef));
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
    const cmds: string[] = [];

    if (installUtil == "sudo apt") {
      cmds.push("curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl");
      cmds.push("chmod +x ./kubectl");
      cmds.push("sudo mv ./kubectl /usr/local/bin/kubectl");
    } else {
      cmds.push(this.chocoOrBrew(installUtil, installRef));
    }
    return cmds;
  }

  /**
   * Install EKS command line tool command
   * 
   * @returns Array of installation commands that are run by the wizard
   */
  public static async installEksctl(): Promise<string[]> {
    const installUtil: string = await OsUtils.getCommand(CommandNames.installUtil);
    const installRef: string = await InstallSwRefs.getInstallRef(installUtil, Software.Minikube);
    const cmds: string[] = [];

    if (installUtil == "sudo apt") {
      cmds.push('curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp');
      cmds.push("sudo mv /tmp/eksctl /usr/local/bin");
    } else {
      cmds.push(this.chocoOrBrew(installUtil, installRef));
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
    if (installUtil == "choco") {
      return `${installUtil} install -y ${installRef}`;
    } else {
      return (software == Software.Kustomize) ? installRef : `${installUtil} install ${installRef}`;
    }
    
  }

  /**
   * Attempts to confirm a software's installation status
   * 
   * @param software is the software that is being checked
   * @returns a boolean that indicates if a software has already been installed
   */
  public static async isInstalled(software: string): Promise<boolean> {
    const bashRef = await InstallSwRefs.getBashRef(software);

    if(bashRef == "brew"){
      try {
        const str = `which ${bashRef}`;
        const result = await runExecSync(str);
        if (result) {
          return (result.search(/not found/) == -1);
        } else {
          Promise.reject(`Something went wrong when checking ${software}`);
        }
      } catch (err) {
        Promise.reject(`Error when checking software ${software}: ${err}`);
      }

    } else {
      try {
        let str: string = null;
        if (bashRef == "minikube" || bashRef == "kustomize" || bashRef == "kubectl") {
          (bashRef == "kubectl") ? str = `${bashRef} version --client=true` : str = `${bashRef} version`;
        } else {
          (bashRef == "java") ? str = `${bashRef} -version` : str = `${bashRef} --version`;
        }
        const result = await runExecSync(str, {stdio: [2, "pipe"]});
        if (result) {
          return (result.search(/is not recognized/) == -1);
        } else {
          return false;
        }
      } catch (err) {
        if (err.stderr) {
          return (err.stderr.toString().search(/is not recognized/) == -1);
        }
        Promise.reject(`Software ${software}: ${err}`);
      }  
    }
  }

  /**
   * When install tool is Chocolatey or Homebrew, only two types of strings are needed
   * 
   * @param {string} installUtil installation utility
   * @param {string} installRef installation reference
   * @returns {string} install command for either installation utility
   */
  private static chocoOrBrew(installUtil: string, installRef: string): string {
    return (installUtil == "choco") ? `${installUtil} install -y ${installRef}`
    : `${installUtil} install ${installRef}`;
  }
}

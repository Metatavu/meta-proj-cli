import Vorpal from "vorpal";
import { runExecSync } from "../classes/exec-sync-utils";
import { InstallUtils } from "../classes/install-utils";
import { Software } from "../interfaces/types";

const choices = [
  Software.NodeJs,
  Software.GitHub,
  Software.GitCLI,
  Software.Maven,
  Software.JDK8,
  Software.JDK11,
  Software.Homebrew,
  Software.Docker,
  Software.Minikube,
  Software.KubernetesCLI,
  Software.Kustomize,
  Software.EKSctl,
  Software.AWSCLI
];
let installCommands = null;

/**
 * Installs software with a given flag, or activates a wizard to give options
 * 
 * @param args gets an object that can contain the software(string)'s name and options
 * options include:
 * software(string)
 */
async function action(args) {
  let software: string = args.options.software;

  if (!software) {
    try {
      const softwareResult = await this.prompt({
        type: 'list',
        name: 'software',
        choices: choices,
        message: "Software to be installed: "
      });
      if (softwareResult.name) {
        software = softwareResult.name;
      } else {
        throw new Error("No software name given, cancelling command");
      }
    } catch(err) {
      throw new Error(`Encountered error while prompting: ${err}`);
    }
  }
  this.log(`Attempting to install ${software}...`);
  
  try {

    if (software == Software.Homebrew) {
      installCommands = await InstallUtils.installBrew();

    } else if (software == Software.Minikube) {
      installCommands = await InstallUtils.installKube();

    } else if (software == Software.KubernetesCLI) {
      installCommands = await InstallUtils.installKubeCtl();

    } else if (software == Software.EKSctl) {
      installCommands = await InstallUtils.installEksctl();

    } else {
      installCommands = await InstallUtils.installSW(software);
    }

    if (typeof(installCommands) === "string") {
      await runExecSync(installCommands);
    } else {
      for (const cmd in installCommands) {
        await runExecSync(cmd);
      }
    }
    
  } catch (err) {
    throw new Error(`Error during ${software} installation process: ${err}`);
  }
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const installWizard = (vorpal: Vorpal): Vorpal.Command => vorpal
  .command("install", `Installs required software, run without flags to enter wizard mode`)
  .option(
    '-s, --software <type>',
    'specify the software to install, leave empty to enter wizard',
    ['NodeJs', 'GitHub', 'Git CLI', 'Maven', 'Java Development Kit 8', 'Java Development Kit 11', 'Homebrew', 'Docker', 'Minikube', 'Kubernetes CLI', 'Kustomize']
  )
  .action(action);

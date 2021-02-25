import Vorpal from "vorpal";
import { CheckUtils } from "../classes/check-utils";
import { CheckSet, Software } from "../interfaces/types";

const choices = [
  { name: Software.NodeJs, checked: true },
  { name: Software.GitHub, checked: true },
  { name: Software.GitCLI, checked: true },
  { name: Software.Maven, checked: true }, 
  { name: Software.JDK8, checked: true },
  { name: Software.JDK11, checked: false },
  { name: Software.Homebrew, checked: true },
  { name: Software.Docker, checked: true },
  { name: Software.Minikube, checked: true },
  { name: Software.KubernetesCLI, checked: true },
  { name: Software.Kustomize, checked: true }
];

/**
 * Shows a debug message
 */
async function action() {
  try {
    const tests: CheckSet[] = [];
    const checkBoxResult = await this.prompt({
      type: "checkbox",
      name: "software",
      choices: choices,
      message: "Check if installed: "
    });

    if(checkBoxResult.software) {

      for (let i = 0; i < checkBoxResult.software.length; i++) {
        tests.push({ checkable: checkBoxResult.software[i], details: { } })
      }
    }
    this.log(await CheckUtils.checkPreq(tests));
    this.log(`test: successful`);
  } catch (err) {
    throw new Error(`Error when performing tests: ${err}`);
  }
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const test = (vorpal: Vorpal): Vorpal.Command => vorpal
  .command("test", `Outputs a debug message`)
  .action(action);

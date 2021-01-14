import * as Vorpal from "vorpal";
import { exec } from 'child_process';

const vorpal = new Vorpal();

/**
 * creates a new github repo
 */
async function action(args) {
  await exec("gh repo create testirepo -y --public", (error, stdout, stderr) => {
    this.log(stdout);
  });
}

/**
 * exports contents of file to be usable by main.ts
 */
export const newRepo = (vorpal: Vorpal) => vorpal
  .command("new-repo", `Creates a new github repository`)
  .action(action);

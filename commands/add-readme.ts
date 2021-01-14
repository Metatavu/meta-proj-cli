import * as Vorpal from "vorpal";
import { execSync } from 'child_process';

const vorpal = new Vorpal();

/**
 * adds a readme to given repo
 * 
 * @param args receives strings from stdin
 */
async function action(args) {
  
  await execSync("git init", {cwd : "./git-container"});
  await execSync("git add README.md", {cwd : "./git-container"});
  await execSync('git commit -m "first commit"', {cwd : "./git-container"});
  await execSync("git branch -M master", {cwd : "./git-container"});
  await execSync(`git remote add origin git@github.com:eetupur/testirepo.git`, {cwd : "./git-container"});
  await execSync("git push -u origin master", {cwd : "./git-container"});
  
}

/**
 * exports contents of file to be usable by main.ts
 */
export const addReadme = (vorpal: Vorpal) => vorpal
  .command("add-readme", `Adds a template README to repo`)
  .action(action);

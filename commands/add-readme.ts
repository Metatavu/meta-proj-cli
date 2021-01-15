import * as Vorpal from "vorpal";
import { execSync } from 'child_process';

const vorpal = new Vorpal();

/**
 * adds a readme to given repo
 * 
 * @param args receives strings from stdin
 */
async function action(args) {

  let path : string = "./git-container";

  if(args.options.path){
    path = args.options.path;

    this.log(path);

    await execSync(`mkdir ${path}`);
    await execSync(`cp README.md ${path}`, { cwd : "./git-container"});

  }

  await execSync("git init", {cwd : path});
  await execSync("git add README.md", {cwd : path});
  await execSync('git commit -m "first commit"', {cwd : path});
  await execSync("git branch -M master", {cwd : path});
  await execSync(`git remote add origin git@github.com:eetupur/testi.git`, {cwd : path});
  await execSync("git push -u origin master", {cwd : path});

}

/**
 * exports contents of file to be usable by main.ts
 */
export const addReadme = (vorpal: Vorpal) => vorpal
  .command("add-readme", `Adds a template README to repo`)
  .option('-p, --path <absolute path>', 'creates a folder to initialize the repository in. !!use only if you want a local copy!!')
  .action(action);

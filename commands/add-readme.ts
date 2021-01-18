import Vorpal from "vorpal";
import { execSync } from "child_process";

const vorpal = new Vorpal();

/**
 * Adds a readme to given repo
 * 
 * @param args optional, contains options object, which contains flag data
 * Path(string) 
 */
async function action(args: { options: { path: string; }; }) {

  let path : string = "./git-container";

  if(args.options.path){
    path = args.options.path;

    await execSync(`mkdir ${path}`);
    await execSync(`cp README.md ${path}`, { cwd : "./git-container"});
  }

  await execSync("git init", {cwd : path});
  await execSync("git add README.md", {cwd : path});
  await execSync('git commit -m "first commit"', {cwd : path});
  await execSync(`git remote add origin ${process.env.GIT_REPO_BASE_PATH}`, {cwd : path});
  await execSync("git push -u origin master", {cwd : path});

  if(!args.options.path){
    await execSync("rm -r .git", {cwd : path});
  }
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const addReadme = (vorpal : Vorpal) => vorpal
  .command("add-readme", `Adds a template README to repo`)
  .option('-p, --path <absolute path>', 'creates a folder to initialize the repository in. !!use only if you want a local copy!!')
  .action(action);

import Vorpal from "vorpal";
import { execSync } from "child_process";

const { HOME } = process.env;

const vorpal = new Vorpal();

/**
 * Adds a readme to given repo
 * 
 * @param args optional, contains options object, which contains flag data
 * Path(string) 
 */
async function action(args: { options: { path: string; }; }) {
  let path : string = `${HOME}/.meta-proj-cli/projects/git-container`;
  let argPath : string = args.options.path;

  if (args.options.path) {
    path = argPath.startsWith("~") ? 
      HOME + argPath.slice(1) :
      argPath;

    execSync(`mkdir ${path}`);
    execSync(`cp README.md ${path}`, { cwd : "./resources"});
  }

  execSync("git init", {cwd : path});
  execSync("git add README.md", {cwd : path});
  execSync('git commit -m "first commit"', {cwd : path});
  execSync(`git remote add origin ${process.env.GIT_REPO_BASE_PATH}`, {cwd : path});
  execSync("git push -u origin master", {cwd : path});

  if (!args.options.path) {
    execSync("rm -r .git", {cwd : path});
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

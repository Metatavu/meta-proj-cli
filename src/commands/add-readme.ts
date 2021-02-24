import Vorpal from "vorpal";
import { runExecSync } from "../classes/exec-sync-utils";

const { HOME } = process.env;

/**
 * Adds a readme to given repo
 * 
 * @param args optional, contains options object, which contains flag data
 * Path(string) 
 */
async function action(args: { options: { path: string; }; }) {
  let path = `${HOME}/.meta-proj-cli/projects/git-container`;
  const argPath  = args.options.path;

  if (args.options.path) {
    path = argPath.startsWith("~") ? 
      HOME + argPath.slice(1) :
      argPath;

      await runExecSync(`mkdir ${path}`);
      await runExecSync(`cp README.md ${path}`, { cwd : "../resources"});
  }

  await runExecSync("git init", {cwd : path});
  await runExecSync("git add README.md", {cwd : path});
  await runExecSync('git commit -m "first commit"', {cwd : path});
  await runExecSync(`git remote add origin ${process.env.GIT_REPO_BASE_PATH}`, {cwd : path});
  await runExecSync("git push -u origin master", {cwd : path});

  if (!args.options.path) {
    await runExecSync("rm -r .git", {cwd : path});
  }
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const addReadme = (vorpal : Vorpal) : Vorpal.Command => vorpal
  .command("add-readme", `Adds a template README to repo`)
  .option('-p, --path <absolute path>', 'creates a folder to initialize the repository in. !!use only if you want a local copy!!')
  .action(action);

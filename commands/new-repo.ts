import Vorpal from "vorpal";
import { execSync } from "child_process";
import * as path from "path";

const vorpal = new Vorpal();

const { HOME } = process.env;
const defaultPath = `${HOME}/.meta-proj-cli/projects`;

/**
 * Creates a new github repo with given flags, or activates a wizard to ask for settings
 * 
 * @param args gets an object that should always contain a name(string) and possibly options
 * options include:
 * publicity(string)
 * path(string)
 * description(string)
 */
async function action(args) {
  const repoName : string = args.name;
  let publicity : string = args.options.publicity;
  let description : string = args.options.description;

  let givenPath : string =  args.options.path ?
    args.options.path :
    defaultPath;

  if (!args.options.publicity) {

    const publicityResult = await this.prompt({
      type : 'input',
      name : 'publicity',
      message : "set the publicity of the repository (public, private, internal): "
    });

    const descriptionResult = await this.prompt({
      type : 'input',
      name : 'description',
      message : "give a description for the repository: "
    });

    const pathResult = await this.prompt({
      type : 'input',
      name : 'path',
      message : "set a path where to initiate repository, leave empty for default: "
    });

    publicity = publicityResult.publicity;
    description = descriptionResult.description;
    if (pathResult?.path) {
      givenPath = pathResult.path;
    }
  }

  givenPath = path.join(...givenPath.split(/\/|\\/));

  givenPath = (givenPath[0] === "~") ? 
      path.join(HOME, givenPath.slice(1)) :
      givenPath;

  givenPath = path.sep + givenPath;
  
  const repoPath : string = path.join(givenPath, repoName);

  execSync(
    `gh repo create ${repoName} --${publicity} ${description ? `-d="${description}"`: ""} -y`,
    {cwd : givenPath}
  );
  execSync(`mkdir ${repoPath}`);
  execSync("git init", {cwd : repoPath});
  execSync(
    `git remote add origin git@github.com:${process.env.GIT_ORGANIZATION}/${repoName}.git`,
    {cwd : repoPath}
  );
  execSync("git checkout -q -b develop", {cwd : repoPath});
  execSync(`cp README.md ${repoPath}`, { cwd : "./resources"});
  execSync(`git add README.md`, {cwd : repoPath});
  execSync(`git commit -q -m "first commit"`, {cwd : repoPath});
  execSync(`git push -q origin develop`, {cwd : repoPath});
  execSync(`git checkout -q -b master`, {cwd : repoPath});
  execSync(`git push -q origin master`, {cwd : repoPath});
  execSync(`git checkout -q develop`, {cwd : repoPath});
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const newRepo = (vorpal : Vorpal) => vorpal
  .command("new-repo <name>", `Creates a new github repository, add no flags to enter wizard mode`)
  .option(
    '-p, --publicity <type>',
    'sets the publicity of the repository (public, private, internal), leave empty to enter wizard',
    ['public', 'private', 'internal']
  )
  .option(
    '--path <absolute path>',
    'specify a path where set up the local repository (leave empty for default)'
  )
  .option(
    '-d, --description <text>',
    'specify a description for the repository, "use double quotes"'
  )
  .action(action);

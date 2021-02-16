import Vorpal from "vorpal";
import { execSync } from "child_process";
import * as path from "path";
import { PathUtils } from "../classes/path-utils";
import OsUtils from "../classes/os-utils";
import { ProjConfigUtils } from "../classes/proj-config-utils";

const { HOME } = process.env;
const defaultPath = `${HOME}/.meta-proj-cli/projects`;

/**
 * Creates a new github repo with given flags, or activates a wizard to ask for settings
 * 
 * @param args gets an object that can contain a name(string) and options
 * options include:
 * publicity(string)
 * path(string)
 * description(string)
 */
async function action(args) {
  let repoName : string = args.name;
  let description : string = args.options.description;
  const template = args.options.template;

  let publicity : string = args.options.publicity ?
    args.options.publicity :
    "private";

  let givenPath : string =  args.options.path ?
    args.options.path :
    defaultPath;

  if (!publicity || !repoName) {
    try {
      if (!repoName) {
        const nameResult = await this.prompt({
          type : 'input',
          name : 'name',
          message : "Give a name for the repository (leave empty to cancel): "
        });
  
        if (nameResult.name) {
          repoName = nameResult.name;
        } else {
          throw new Error("No name given, cancelling command");
        }
      }

      const publicityResult = await this.prompt({
        type : 'list',
        name : 'publicity',
        choices : ["private", "internal", "public"],
        message : "Set the publicity of the repository: "
      });
  
      const descriptionResult = await this.prompt({
        type : 'input',
        name : 'description',
        message : "Give a description for the repository: "
      });
  
      const pathResult = await this.prompt({
        type : 'input',
        name : 'path',
        message : "Set a path where to initiate repository, leave empty for default: "
      });

      description = descriptionResult.description;

      publicity = publicityResult.publicity;
      
      if (pathResult?.path) {
        givenPath = pathResult.path;
      }
    } catch(err) {
      throw new Error(`encountered error while prompting: ${err}`);
    }
  }

  givenPath = await PathUtils.fixPath(givenPath);
  
  const folderPath : string = PathUtils.outerFolder(givenPath, repoName);
  const repoPath : string = PathUtils.repoFolder(givenPath, repoName);

  execSync(`mkdir ${folderPath}`);
  execSync(
    `gh repo create\
    ${process.env.GIT_ORGANIZATION}/${repoName}\
    --${publicity}\
    ${description ? `-d="${description}"` : ""}\
    ${template ? `--template="${process.env.GIT_ORGANIZATION}/${template}"` : ""}\
    -y`,
    {cwd : folderPath}
  );

  if (template) {
    execSync(`git pull -q git@github.com:${process.env.GIT_ORGANIZATION}/${template}.git`, {cwd : repoPath});
    execSync("git branch -m master develop", {cwd : repoPath});
    finishRepo(repoPath);
  } else {
    const copy: string = await OsUtils.getCommand("copy");
    try {
      execSync("git init", {cwd : repoPath});
      execSync(`${copy} project-config-template.json ${folderPath}${path.sep}project-config.json`, {cwd : `.${path.sep}resources`});
      execSync("git checkout -q -b develop", {cwd : repoPath});
      execSync(`${copy} README.md ${repoPath}`, {cwd : `.${path.sep}resources`});
      execSync(`git add README.md`, {cwd : repoPath});
      execSync(`git commit -q -m "first commit"`, {cwd : repoPath});
      execSync(`git push -q origin develop`, {cwd : repoPath});
      finishRepo(repoPath);
      const projConfigData = await ProjConfigUtils.readProjConfig(folderPath);
      projConfigData.projectName = repoName;
      await ProjConfigUtils.writeProjConfig(folderPath, JSON.stringify(projConfigData));
    } catch (err) {
      throw new Error(`Encountered error while creating local repository: ${err}`);
    }
  }
}

function finishRepo (repoPath) {
  execSync(`git checkout -q -b master`, {cwd : repoPath}); 
  execSync(`git push -q origin master`, {cwd : repoPath, stdio : ["ignore", "ignore", "ignore"]});
  execSync(`git checkout -q develop`, {cwd : repoPath});
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const newRepo = (vorpal : Vorpal) : Vorpal.Command => vorpal
  .command("new-repo [name]", `Creates a new github repository, run without params or flags to enter wizard mode`)
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
  .option(
    '-t, --template <text>', 'specify a template (if any) from which to make the repository'
  )
  .action(action);

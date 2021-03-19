import Vorpal from "vorpal";
import { PathUtils } from "../classes/path-utils";
import { ProjConfigUtils } from "../classes/proj-config-utils";
import { runExecSync } from "../classes/exec-sync-utils";
import { PromptUtils } from "../classes/prompt-utils";
import OsUtils from "../classes/os-utils";
import path from "path";

const { HOME } = process.env;
const defaultPath = `${HOME}/.meta-proj-cli/projects`;
let repoName: string = null;
let description: string = null;
let template: string = null;
let publicity: string = null;
let givenPath: string = null;
let folderPath: string = null;
let repoPath: string = null;
let hasFolder = false;
let hasReadme = false;

/**
 * Creates a new github repo with given flags, or activates a wizard to ask for settings
 * 
 * @param args gets an object that can contain a name(string) and options
 * options include:
 * publicity(string)
 * path(string)
 * description(string)
 * template(string)
 * hasFolder(boolean)
 * hasReadme(boolean)
 */
async function action(args) {
  repoName = args.name;
  description = args.options.description;
  template = args.options.template;
  publicity = args.options.publicity ? args.options.publicity : "private";
  givenPath = args.options.path ? args.options.path : defaultPath;
  hasFolder = (args.options.hasFolder);
  hasReadme = (args.options.hasReadme);
  
  if (!publicity || !repoName) {
    try {
      if (!repoName) {
        const nameResult = await PromptUtils.inputPrompt(this, "Give a name for the repository (leave empty to cancel): ");
        if (nameResult) {
          repoName = nameResult;
        } else {
          throw new Error("No name given, cancelling command");
        }
      }

      publicity = await PromptUtils.listPrompt(this, "Set the publicity of the repository: ", [ "private", "internal", "public" ]);
  
      description = await PromptUtils.inputPrompt(this, "Give a description for the repository: ");
      
    } catch(err) {
      throw new Error(`encountered error while prompting: ${err}`);
    }
  }

  givenPath = await PathUtils.fixPath(givenPath);
  folderPath = PathUtils.outerFolder(givenPath, repoName);
  repoPath = PathUtils.repoFolder(givenPath, repoName);

  finishRepo();
}

/**
 * Runs repository creation commands based on user given parameters
 */
async function finishRepo() {
  try {
    if (!hasFolder) {
      await runExecSync(`mkdir ${folderPath}`);
    }
    await runExecSync(
      `gh repo create\
      ${process.env.GIT_ORGANIZATION}/${repoName}\
      --${publicity}\
      ${description ? `-d="${description}"` : ""}\
      ${template ? `--template="${process.env.GIT_ORGANIZATION}/${template}"` : ""}\
      -y`,
      { cwd: folderPath }
    );

    if (template) {
      await runExecSync(`git pull -q git@github.com:${process.env.GIT_ORGANIZATION}/${template}.git`, { cwd: repoPath });
      await runExecSync("git branch -m master develop", { cwd: repoPath });
      await checkout();
    } else {
      await runExecSync("git init", { cwd: repoPath });
      await runExecSync("git checkout -q -b develop", { cwd: repoPath });

      if (!hasReadme) { 
        const copy = await OsUtils.getCommand("copy");
        await runExecSync(`${copy} README.md ${repoPath}`, { cwd : `.${path.sep}resources` });
      }

      await runExecSync(`git add README.md`, { cwd: repoPath });
      await runExecSync(`git commit -q -m "first commit"`, { cwd: repoPath });
      await runExecSync(`git push -q origin develop`, { cwd: repoPath });
      await checkout();
      const projConfigData = await ProjConfigUtils.readProjConfig(folderPath);
      projConfigData.projectName = repoName;
      await ProjConfigUtils.writeProjConfig(folderPath, JSON.stringify(projConfigData));
    }
  } catch (err) {
    throw new Error(`Error when initing a repository: ${err}`);
  }
}

async function checkout() {
  await runExecSync(`git checkout -q -b master`, { cwd: repoPath }); 
  await runExecSync(`git push -q origin master`, { cwd: repoPath, stdio: [ "ignore", "ignore", "ignore" ] });
  await runExecSync(`git checkout -q develop`, { cwd: repoPath });
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const newRepo = (vorpal: Vorpal): Vorpal.Command => vorpal
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
  .option(
    '--hasFolder', 'intended for automatical running. Add this if the project already has a folder'
  )
  .option(
    '--hasReadme', 'intended for automatical running. Add this if the project already has a readme.md'
  )
  .action(action);

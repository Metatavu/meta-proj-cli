import Vorpal from "vorpal";
import { PathUtils } from "../classes/path-utils";
import { ProjConfigUtils } from "../classes/proj-config-utils";
import { runExecSync } from "../classes/exec-sync-utils";
import { PromptUtils } from "../classes/prompt-utils";

const { HOME } = process.env;
const defaultPath = `${HOME}/.meta-proj-cli/projects`;
let repoName: string = null;
let description: string = null;
let template: string = null;
let publicity: string = null;
let givenPath: string = null;
let folderPath: string = null;
let repoPath: string = null;

/**
 * Creates a new github repo with given flags, or activates a wizard to ask for settings
 * 
 * @param args gets an object that can contain a name(string) and options
 * options include:
 * publicity(string)
 * path(string)
 * description(string)
 * template(string)
 */
async function action(args) {
  repoName = args.name;
  description = args.options.description;
  template = args.options.template;
  publicity = args.options.publicity ? args.options.publicity : "private";
  givenPath = args.options.path ? args.options.path : defaultPath;
  
  if (!publicity || !repoName) {
    try {
      if (!repoName) {
        console.log(1);
        const nameResult = await PromptUtils.inputPrompt(this, "Give a name for the repository (leave empty to cancel): ");
        console.log(2);
        if (nameResult) {
          repoName = nameResult;
        } else {
          console.log(5)
          throw new Error("No name given, cancelling command");
        }
      }

      const publicityResult = await PromptUtils.listPrompt(this, "Set the publicity of the repository: ", [ "private", "internal", "public" ]);
  
      const descriptionResult = await PromptUtils.inputPrompt("Give a description for the repository: ");

      description = descriptionResult;
      publicity = publicityResult;

      console.log("repoName: " + repoName + "description: " + description + "publicity: " + publicity);
      
    } catch(err) {
      throw new Error(`encountered error while prompting: ${err}`);
    }
  }

  givenPath = await PathUtils.fixPath(givenPath);
  folderPath = PathUtils.outerFolder(givenPath, repoName);
  repoPath = PathUtils.repoFolder(givenPath, repoName);

  //finishRepo();
}

/**
 * Runs repository creation commands based on user given parameters
 */
async function finishRepo() {
  try {
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
  .action(action);

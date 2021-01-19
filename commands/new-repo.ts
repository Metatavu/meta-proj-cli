import Vorpal from "vorpal";
import { promisify } from "util";

const exec = promisify(require("child_process").exec);

const vorpal = new Vorpal();

/**
 * Creates a new github repo with given flags, or activates a wizard to ask for settings
 * 
 * @param args gets an object that should always contain a name(string) and possibly options
 * options include:
 * publicity(string)
 * description(string)
 */
async function action(args) {
  const name : string = args.name;
  let publicity : string = "";
  let description : string = "";
  let error = null;

  if(!args.options.publicity) {

    const pubPrompt = this.prompt({
      type : 'input',
      name : 'publicity',
      message : "set the publicity of the repository (public, private, internal): "
    });

    await pubPrompt.then((result) => {
      publicity = result.publicity;
    });

    const descPrompt = this.prompt({
      type : 'input',
      name : 'description',
      message : "give a description for the repository: "
    });

    await descPrompt.then((result) => {
      description = result.description;
    });

    // await this.prompt({
    //   type : 'input',
    //   name : 'publicity',
    //   message : "set the publicity of the repository (public, private, internal): "
    // },
    // (result) => {
    //   publicity = result.publicity;
    // });

    
    // await this.prompt({
    //   type : 'input',
    //   name : 'description',
    //   message : "give a description for the repository: "
    // },
    // (result) => {
    //   description = result.description;
    // });
    
  } else {
    publicity = args.options.publicity;
    description = args.options.description;
  }

  const command = await exec(`gh repo create ${name} -y --${publicity} ${description ? `-d="${description}"`: ""}`)
  .catch((error) => {
    error = error;
  });

  if (error && !command.stdout){
    this.log(error);
    this.log(command.stderr);
  }

  // await exec(`gh repo create ${name} -y --${publicity} ${description ? `-d="${description}"`: ""}`, (error, stdout, stderr) => {
  //   if((stderr || error) && !stdout) {
  //     this.log("### an error has occurred, check your command ###");
  //     this.log(error);
  //     this.log(stderr);
  //   }
  // });
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
    '-d, --description <text>',
    'specify a description for the repository, "use double quotes"'
  )
  .action(action);

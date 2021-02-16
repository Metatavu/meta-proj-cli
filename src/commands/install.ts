import Vorpal from "vorpal";

/**
 * Installs software with a given flag, or activates a wizard to give options
 * 
 * @param args gets an object that can contain the software(string)'s name and options
 * options include:
 * software(string)
 */
async function action(args){
  let software : string = args.options.software;

  if(!software){
    try {
      const softwareResult = await this.prompt({
        type : 'list',
        name : 'software',
        choices : ['NodeJs', 'GitHub', 'Git CLI', 'Maven', 'Java Development Kit 8', 'Java Development Kit 11', 'Homebrew'],
        message : "Software to be installed: "
      });
      if (softwareResult.name) {
        software = softwareResult.name;
      } else {
        throw new Error("No software name given, cancelling command");
      }
    } catch(err) {
      throw new Error(`Encountered error while prompting: ${err}`);
    }
  }
  this.log(`Attempting to install ${software}...`);
  /*
  const installCommand : string = await InstallUtils.installSW(software);
  try {
    execSync(installCommand);
  } catch (err) {
    throw new Error(`Error during ${software} installation process: ${err}`);
  }
  */
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const installWizard = (vorpal: Vorpal): Vorpal.Command => vorpal
  .command("install", `Installs required software, run without flags to enter wizard mode`)
  .option(
    '-s, --software <type>',
    'specify the software to install, leave empty to enter wizard',
    ['NodeJs', 'GitHub', 'Git CLI', 'Maven', 'Java Development Kit 8', 'Java Development Kit 11', 'Homebrew']
  )
  .action(action);

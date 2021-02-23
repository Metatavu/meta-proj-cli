import { execSync, ExecSyncOptionsWithBufferEncoding } from "child_process";

const fileExtensions : RegExp[] = [
  /;/, /\.exe$/, /\.com$/, /\.dll$/, /\.vbs$/, /\.vb$/, /\.vbe$/, /\.pif$/, /\.application$/, /\.gadget$/, /\.ws$/, /\.wsf$/,/\.reg$/,
  /\.msi$/, /\.msp$/, /\.scr$/, /\.hta$/, /\.cpl$/, /\.msc$/, /\.jar$/, /\.bat$/, /\.cmd$/, /\.js$/, /\.jse$/, /\.wsc$/, /\.wsh$/,
  /\.ps.$/, /\.ps.xml$/, /\.psc.$/, /\.msh$/, /\.msh.$/, /\.mshxml$/, /\.msh.xml$/, /\.pdf$/, /\.sfx$/, /\.tmp$/, /\.py$/
];

/**
 * runs the given command in a shell, denies attempts of injection
 * 
 * @param {string} command command to be run in shell
 * @param {ExecSyncOptionsWithBufferEncoding} options options to be provided to the shell
 * @returns {Promise<string | void>} if command outputs, will provide it as string
 */
export const runExecSync = async (command: string, options?: ExecSyncOptionsWithBufferEncoding): Promise<string | void> => {
  let harmful = false;
  let foundExt : string = null;

  try {
    /**
     * Deny executable, shell, installation, registry and python files,
     * files that are run in a sandbox without checks as well as files with possible malware included
     */
    for (const ext in fileExtensions) {
      if (command.search(ext) != -1) {
        harmful = true;
        foundExt = ext;
      }
    }

    if (!harmful) {
      return execSync(command, options)?.toString(); //NOSONAR
    } else {
      if (foundExt == ";") {
        throw new Error(`There was an attempt to execute extra commands.`);
      } else {
        throw new Error(`Found out that there was an attempt to execute ${foundExt} file.`);
      }
    }
    

  } catch (err) {
    throw new Error(`Error while executing command ${command}, with options ${options}. Error: ${err}`);
  }
}

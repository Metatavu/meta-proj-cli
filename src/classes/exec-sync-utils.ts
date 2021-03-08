import { execSync, ExecSyncOptionsWithBufferEncoding } from "child_process";

/**
 * An array of file extensions and other parts of string that are not supposed to be found in executable strings
 */
const fileExtensions : RegExp[] = [
  /;/, /\.exe$/, /\.com$/, /\.dll$/, /\.vbs$/, /\.vb$/, /\.vbe$/, /\.pif$/, /\.application$/, /\.gadget$/, /\.ws$/, /\.wsf$/,/\.reg$/,
  /\.msi$/, /\.msp$/, /\.scr$/, /\.hta$/, /\.cpl$/, /\.msc$/, /\.jar$/, /\.bat$/, /\.cmd$/, /\.js$/, /\.jse$/, /\.wsc$/, /\.wsh$/,
  /\.ps.$/, /\.ps.xml$/, /\.psc.$/, /\.msh$/, /\.msh.$/, /\.mshxml$/, /\.msh.xml$/, /\.pdf$/, /\.sfx$/, /\.tmp$/, /\.py$/
];

/**
 * Runs the given command in a shell, denies attempts of injection
 * 
 * @param {string} command command to be run in shell
 * @param {ExecSyncOptionsWithBufferEncoding} options options to be provided to the shell
 * @returns {Promise<string | void>} if command outputs, will provide it as string
 */
export const runExecSync = async (command: string, options?: ExecSyncOptionsWithBufferEncoding): Promise<string | void> => {
  let harmful = false;
  let foundExt: string = null;

  try {
    /**
     * Deny executable, shell, installation, registry and python files,
     * files that are run in a sandbox without checks as well as files with possible malware included
     */
    for (const ext in fileExtensions) {
      if (command.search(ext) != -1) {
        harmful = true;
        foundExt = ext.toString();
      }
    }

    /**
     * Run safe commands in the shell only
     */
    if (!harmful) {
      return execSync(command, options)?.toString(); //NOSONAR

    } else {
      if (foundExt == ";") {
        return Promise.reject(`There was an attempt to execute extra commands.`);
      } else {
        return Promise.reject(`Found out that there was an attempt to execute ${foundExt} file.`);
      }
    }
    
  } catch (err) {
    if (err.stderr) {
      return err.stderr.toString();
    } else {
      Promise.reject(`Error while executing command ${command}, with options ${options}: ${err}`);
    }
  }
}

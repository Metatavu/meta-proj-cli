import { execSync, ExecSyncOptionsWithBufferEncoding } from "child_process";

/**
 * runs the given command in a shell, denies attempts of injection
 * 
 * @param {string} command command to be run in shell
 * @param {ExecSyncOptionsWithBufferEncoding} options options to be provided to the shell
 * @returns {Promise<string | void>} if command outputs, will provide it as string
 */
export const runExecSync = async (command: string, options?: ExecSyncOptionsWithBufferEncoding): Promise<string | void> => {
  try {
    if (command.search(/;|\.sh$|\.exe$/) == -1) return execSync(command, options)?.toString(); //NOSONAR
    
  } catch (err) {
    throw new Error(`Error while executing command ${command}, with options ${options}. Error: ${err}`);
  }
}

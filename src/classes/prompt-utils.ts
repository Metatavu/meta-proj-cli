/**
 * Provides functions for prompting user, helps shorten syntax
 */
export class PromptUtils {
  /**
   * Prompts the user with a message, that accepts text based input
   * 
   * @param message the message to show to the user
   * @returns the user input
   */
  static inputPrompt = async (instance: any, message: string): Promise<string | null> => {
    try {
      const prompt = await instance.prompt({
        type: "input",
        name: "output",
        message: message
      });

      return prompt.output;
    } catch (err) {
      throw new Error(`Error while input-prompting "${message}", Error: ${err}`);
    }
  }

  /**
   * Prompts the user with a message, that offers a yes/no choise for input
   * 
   * @param message the message to show to the user
   * @returns users input (string containing either "yes" or "no");
   */
  static confirmPrompt = async (instance: any, message: string): Promise<string | null> => {
    try {
      const prompt = await instance.prompt({
        type: "confirm",
        name: "output",
        message: message
      });

      return prompt.output;
    } catch (err) {
      throw new Error(`Error while confirm-prompting "${message}", Error: ${err}`);
    }
  }

  /**
   * Prompts the user with a message, that offers given choises as inputs
   * 
   * @param message the message to show to the user
   * @param choices array of choises to show to the user
   * @returns the choise that the user chose
   */
  static listPrompt = async (instance: any, message: string, choices: string[]): Promise<string | null> => {
    try {
      const prompt = await instance.prompt({
        type: "list",
        name: "output",
        message: message,
        choices: choices
      });

      return prompt.output;
    } catch (err) {
      throw new Error(`Error while confirm-prompting "${message}", Error: ${err}`);
    }
  }
}

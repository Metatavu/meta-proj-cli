import { Command, flags } from "@oclif/command"

/**
* Test class
*/
export default class Test extends Command {
  static description = 'test'

  static examples = [
    `test --name=eetu`,
  ]

  static flags = {
    name: flags.string({
      char: "n",
      description: "your name"
    }),
    help: flags.help({char: 'h'})
  }

  /**
   * Function that returns a greeting
   */
  public run = async () => {
    const { flags } = this.parse(Test);
    const name = flags.name ? flags.name : "unknown";
    this.log(`Hello ${name}, how are you doing?`);
  }
}

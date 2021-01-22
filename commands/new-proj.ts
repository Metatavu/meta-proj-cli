import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
import { test } from "./test";

const vorpal = new Vorpal();

/**
 * Prompts the user and runs corresponding commands
 */
async function action() {

  try {
    const repoResult = await this.prompt({
      type : "confirm",
      name : "repoAnswer",
      message : "do you want to make a new repo? "
    });

    if (repoResult.repoAnswer) {
      await this
      .use(newRepo)
      .execSync("new-repo");
    }
  } catch(err) {
    this.log("Encountered error while creating repository: " + err)
  }

  try {
    const testResult = await this.prompt({
      type : "confirm",
      name : "testAnswer",
      message : "do you want to run a test "
    });

    if (testResult.testAnswer) {
      await this
      .use(test)
      .execSync("test");
    }
  } catch(err) {
    this.log(err)
  }
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const newProj = (vorpal : Vorpal) => vorpal
  .command("new-proj", `placeholder description`)
  .action(action);

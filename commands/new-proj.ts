import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
import { test } from "./test";

const vorpal = new Vorpal();

/**
 * Prompts the user and runs corresponding commands
 */
async function action() {
  let projName : string = null;

  try {
    const nameResult = await this.prompt({
      type : "input",
      name : "name",
      message : "Give a name for the project: "
    });

    if (nameResult.name) {
      projName= nameResult.name;
    } else {
      throw new Error("ERROR: No name was given for the project");
    }
  } catch (err) {
    throw(err);
  }

  try {
    await vorpal
    .use(newRepo)
    .execSync("new-repo");
  } catch(err) {
    throw new Error("Encountered an error while creating repository: " + err);
  }

  try {
    const testResult = await this.prompt({
      type : "confirm",
      name : "testAnswer",
      message : "do you want to run a test "
    });

    if (testResult.testAnswer) {
      await vorpal
      .use(test)
      .execSync("test");
    }
  } catch(err) {
    throw new Error(err)
  }
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const newProj = (vorpal : Vorpal) => vorpal
  .command("new-proj", `Start a new project`)
  .action(action);

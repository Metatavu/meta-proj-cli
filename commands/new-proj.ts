import Vorpal from "vorpal";
import { newRepo } from "./new-repo";
import { test } from "./test";
import fs from "fs";
import { ProjectInfo } from "../interfaces/project-info";

const vorpal = new Vorpal();
const projStoragePath = "./storage/project-storage.json";

/**
 * Prompts the user and runs corresponding commands
 */
async function action() {

  let projectStorage = JSON.parse(fs.readFileSync(projStoragePath, "utf8"));

  let projectInfo : ProjectInfo = {
    projectName : null,
    executedCommands : [],
    projectConfig : {}
  }

  try {
    const nameResult = await this.prompt({
      type : "input",
      name : "nameAnswer",
      message : "Give a name for the project: "
    });

    if (nameResult.nameAnswer !== "") {
      projectInfo.projectName = nameResult.nameAnswer;
    } else {
      throw new Error("###ERROR### No name was given for the project, try again with a name");
    }
  } catch (err) {
    throw(err);
  }

  try {
    const repoResult = await this.prompt({
      type : "confirm",
      name : "repoAnswer",
      message : "do you want to make a new repo? "
    });

    if (repoResult.repoAnswer) {
      await vorpal
      .use(newRepo)
      .execSync("new-repo");

      projectInfo.executedCommands.push("new-repo");
    }
  } catch(err) {
    throw("Encountered an error while creating repository: " + err)
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

      projectInfo.executedCommands.push("testi");
    }
  } catch(err) {
    throw(err)
  }

  projectStorage.projects.push(projectInfo);

  fs.writeFileSync(projStoragePath, JSON.stringify(projectStorage));
}

/**
 * Exports contents of file to be usable by main.ts
 * 
 * @param vorpal vorpal instance
 */
export const newProj = (vorpal : Vorpal) => vorpal
  .command("new-proj", `placeholder description`)
  .action(action);

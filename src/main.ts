import Vorpal from "vorpal";
import dotenv from "dotenv";
import { newRepo } from "./commands/new-repo";
import { newProj } from "./commands/new-proj";
import { pullProj } from "./commands/pull-proj";
import { test } from "./commands/checkTest";
import { PathUtils } from "./classes/path-utils";
import { selectOs } from "./commands/select-os";

dotenv.config();

const vorpal = new Vorpal();
PathUtils.savePath().then((path) => {
  PathUtils.checkExists(path);
}).catch((err) => {
  throw new Error("Error when finding default paths: " + err);
});
PathUtils.projectPath().then((path) => {
  PathUtils.checkExists(path);
}).catch((err) => {
  throw new Error("Error when finding default paths: " + err);
});

/**
 * Exposes specified commands to the user
 */
vorpal
  .delimiter("meta-proj-cli~$:")
  .use(selectOs)
  .use(test)
  .use(newRepo)
  .use(newProj)
  .use(pullProj)
  .show();
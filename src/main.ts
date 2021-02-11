import Vorpal from "vorpal";
import dotenv from "dotenv";
import { newRepo } from "./commands/new-repo";
import { newProj } from "./commands/new-proj";
import { pullProj } from "./commands/pull-proj";
import { test } from "./commands/checkTest";
import { PathUtils } from "./classes/path-utils";
import { selectOs } from "./commands/select-os";

async function wrapper(){
  dotenv.config();

  const vorpal = new Vorpal();

  const savePath : string = await PathUtils.savePath();
  const projectPath : string = await PathUtils.projectPath();
  PathUtils.checkExists(savePath);
  PathUtils.checkExists(projectPath);

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
}();

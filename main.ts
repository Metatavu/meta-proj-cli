import Vorpal from "vorpal";
import dotenv from "dotenv";
import { newRepo } from "./commands/new-repo";
import { newProj } from "./commands/new-proj";
import { pullProj } from "./commands/pull-proj";
import { PathUtils } from "./classes/path-utils";

dotenv.config();

const vorpal = new Vorpal();

PathUtils.checkExists(PathUtils.savePath);
PathUtils.checkExists(PathUtils.projectPath);

/**
 * Shows propmt and accepts commands
 * Redirects commands to relevant files
 */
vorpal
  .delimiter("meta-proj-cli~$:")
  .use(newRepo)
  .use(newProj)
  .use(pullProj)
  .show();

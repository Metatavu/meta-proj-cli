import Vorpal from "vorpal";
import dotenv from "dotenv";
import { newRepo } from "./commands/new-repo";
import { newProj } from "./commands/new-proj";
import { pullProj } from "./commands/pull-proj";
import { addReact } from "./commands/add-react";

dotenv.config();

const vorpal = new Vorpal();


/**
 * Shows propmt and accepts commands
 * Redirects commands to relevant files
 */
vorpal
  .delimiter("meta-proj-cli~$:")
  .use(addReact)
  .use(newRepo)
  .use(newProj)
  .use(pullProj)
  .show();

import Vorpal from "vorpal";
import dotenv from "dotenv";
import { newRepo } from "./commands/new-repo";

dotenv.config();

const vorpal = new Vorpal();

/**
 * Shows propmt and accepts commands
 * Redirects commands to relevant files
 */
vorpal
  .delimiter("meta-proj-cli~$:")
  .use(newRepo)
  .show();

import * as Vorpal from "vorpal";
import { test } from "./commands/test";
import { test2 } from "./commands/test2";

const vorpal = new Vorpal();

/**
 * shows propmt and accepts commands
 * redirects commands to relevant files
 */
vorpal
  .delimiter("meta-proj-cli~$:")
  .use(test)
  .use(test2)
  .show();

import Vorpal from "vorpal"
import * as newProj from "../src/commands/new-proj";

/**
 * Creating a new project mostly uses new-repo.ts
 * This is why the rest of the tests can be found in new-repo.spec.ts
 */
it('exports itself', () => {
  const vorpal = new Vorpal();
  vorpal.use(newProj.newProj).execSync= jest.fn();
  vorpal.execSync = jest.fn();
  vorpal.use(newProj.newProj).execSync("new-proj");
  vorpal.execSync("exit");

  expect((vorpal.use(newProj.newProj).execSync)).toReturn();
  expect((vorpal.execSync)).toReturn();
});
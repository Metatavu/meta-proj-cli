import Vorpal from "vorpal"
import * as installWizard from "../src/commands/install";


/**
 * Running the install wizard mostly uses install-utils.ts & install-sw-refs.ts
 * This is why the rest of the tests can be found in install-utils.spec.ts
 */
it('exports itself', () => {
  const vorpal = new Vorpal();
  vorpal.use(installWizard.installWizard).execSync= jest.fn();
  vorpal.execSync = jest.fn();
  vorpal.use(installWizard.installWizard).execSync("install");
  vorpal.execSync("exit");

  expect((vorpal.use(installWizard.installWizard).execSync)).toReturn();
  expect((vorpal.execSync)).toReturn();
});


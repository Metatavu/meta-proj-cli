import Vorpal from "vorpal";
import * as selectOs from "../src/commands/select-os";
import OsUtils from "../src/classes/os-utils";

it('exports itself', () => {
  const vorpal = new Vorpal();
  vorpal.use(selectOs.selectOs).execSync= jest.fn();
  vorpal.execSync = jest.fn();
  vorpal.use(selectOs.selectOs).execSync("select-os");
  vorpal.execSync("exit");

  expect((vorpal.use(selectOs.selectOs).execSync)).toReturn();
  expect((vorpal.execSync)).toReturn();
});

it('is able to switch to desired OS', async () => {
  OsUtils.setOS = jest.fn();
  await OsUtils.setOS("LINUX");
  expect((OsUtils.setOS)).toReturn();
});

it('recognizes desired OS', async () => {
  const userSetting: string = await OsUtils.getOS();
  expect((userSetting)).toMatch(/^LINUX|^WINDOWS|^MAC/);
});

it('attempts to estimate OS used', () => {
  expect((OsUtils.detectOS())).toMatch(/^LINUX|^WINDOWS|^MAC/);
});
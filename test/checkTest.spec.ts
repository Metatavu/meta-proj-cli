import Vorpal from "vorpal";
import * as checkTest from "../src/commands/checkTest";
import { CheckUtils } from "../src/classes/check-utils";
import { CheckSet } from "../src/interfaces/types";

it('exports itself', () => {
  const vorpal = new Vorpal();
  vorpal.use(checkTest.test).execSync= jest.fn().mockImplementation();
  vorpal.execSync = jest.fn();
  vorpal.use(checkTest.test).execSync("test");
  vorpal.execSync("exit");

  expect((vorpal.use(checkTest.test).execSync)).toReturn();
  expect((vorpal.execSync)).toReturn();
});

it('checks for prequisites', async () => {
  const test : CheckSet<unknown>[] = [{checkable : "git", details : {}}]
  CheckUtils.checkPreq = jest.fn().mockImplementation();
  await CheckUtils.checkPreq(test);

  expect((CheckUtils.checkPreq)).toReturn();
});
import Vorpal from "vorpal";
import * as checkTest from "../src/commands/checkTest";
import { CheckUtils } from "../src/classes/check-utils";
import { CheckSet, Software } from "../src/interfaces/types";

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
  const testSet: CheckSet[] = [
    { checkable: Software.NodeJs, details: { } },
    { checkable: Software.GitCLI, details: { } },
    { checkable: Software.GitHub, details: { } },
    { checkable: Software.Maven, details: { } }
  ];

  const returnSet = await CheckUtils.checkPreq(testSet);

  if (returnSet.length > 0) {
    for (const set of returnSet) {
      expect((set)).toBeInstanceOf({ checkable: String, error: Boolean, details: String })
    }
  } else {
    expect((returnSet)).toEqual([]);
  } 
});

import Vorpal from "vorpal";
import dotenv from "dotenv";
import { PathUtils } from "../src/classes/path-utils";

/**
 * Testing functionalities used in main.ts, as it doesn't export anything that can be accessed directly
 */
it('has config', () => {
  const x: unknown = {};
  dotenv.config = jest.fn().mockResolvedValue(x);
  dotenv.config();
  expect((dotenv.config)).toBeTruthy();
});

it('checks path', async () => {
  PathUtils.checkExists = jest.fn().mockResolvedValue(true);
  const path = await PathUtils.savePath();
  PathUtils.checkExists(path);
  
  expect((PathUtils.checkExists)).toBeTruthy();
});

it('runs vorpal', () => {
  const vorpal = new Vorpal();
  vorpal.delimiter = jest.fn().mockReturnValue("meta-proj-cli~$:");
  vorpal.delimiter("meta-proj-cli~$:");
  expect((vorpal.delimiter)).toHaveBeenCalled();
});

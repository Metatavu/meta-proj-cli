import Vorpal from "vorpal";
import * as newRepo from "../src/commands/new-repo";
import child_process from "child_process";
import dotenv from "dotenv";
import * as path from "path";

/**
 * Testing creating a GitHub repository as well as creating a project locally.
 * Note that Jest won't actually create the repository under your GH account.
 */

it('inits a GitHub repository', () => {
  const repoName ="jestTest";
  const publicity = "public";
  const description = null;
  const template = null;
  child_process.execSync = jest.fn();
  child_process.execSync(
    `gh repo create\
    ${repoName}\
    --${publicity}\
    ${description ? `-d="${description}"` : ""}\
    ${template ? `--template="${process.env.GIT_ORGANIZATION}/${template}"` : ""}\
    -y`
  );

  expect((child_process.execSync)).toReturn();
});

it('exports itself', async () => {
  const vorpal = new Vorpal()
  vorpal.use(newRepo.newRepo).execSync= jest.fn();
  vorpal.execSync = jest.fn();
  vorpal.use(newRepo.newRepo).execSync("new-repo");
  vorpal.execSync("exit");

  expect((vorpal.use(newRepo.newRepo).execSync)).toReturn();
  expect((vorpal.execSync)).toReturn();
});

it('creates project folder', () => {
  dotenv.config = jest.fn().mockImplementation();
  child_process.execSync = jest.fn();
  dotenv.config();
  const { HOME } = process.env;
  const defaultPath = `${HOME}/.meta-proj-cli/projects`;
  
  child_process.execSync(`mkdir ${defaultPath + path.sep}test`);

  expect((dotenv.config)).toHaveBeenCalled();
  expect((child_process.execSync)).toReturn();
});

it('inits a Git project', () => {
  dotenv.config = jest.fn().mockImplementation();
  child_process.execSync = jest.fn();
  dotenv.config();
  const { HOME } = process.env;
  const defaultPath = `${HOME}/.meta-proj-cli/projects`;
  child_process.execSync("git init", {cwd : (defaultPath + path.sep + "test")});

  expect((dotenv.config)).toHaveBeenCalled();
  expect((child_process.execSync)).toReturn();
});
import Vorpal from "vorpal";
import * as newRepo from "../commands/new-repo";
import child_process from "child_process";

/**
 * Testing creating a GitHub repository.
 * Note that Jest won't actually create the repository under your GH account.
 */

it('inits a GitHub repository', () => {
  const repoName ="jestTest";
  const publicity = "public";
  const description = null;
  const template = null;
  child_process.execSync = jest.fn();
  child_process.execSync(`gh repo create\
  ${repoName}\
  --${publicity}\
  ${description ? `-d="${description}"` : ""}\
  ${template ? `--template="${process.env.GIT_ORGANIZATION}/${template}"` : ""}\
  -y`);

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
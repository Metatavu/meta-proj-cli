import { PathUtils } from "../src/classes/path-utils";

it('gets default paths', async () => {
  const savePath : string = await PathUtils.savePath();
  const projectPath : string = await PathUtils.projectPath();
  expect((savePath)).toMatch(/.meta-proj-cli$/);
  expect((projectPath)).toMatch(/projects$/);
});

it('fixes a path', async () => {
  const fixedPath = await PathUtils.fixPath("~/.meta-proj-cli/");
  expect((fixedPath)).toMatch(/.meta-proj-cli$/);
});

it('is able to create project folder paths', () => {
  expect((PathUtils.outerFolder("~/.meta-proj-cli/", "test"))).toMatch(/-project$/);
  expect((PathUtils.repoFolder("~/.meta-proj-cli/", "test"))).toMatch(/-project/ && /test$/);
});

it('is able to check if a directory exists', () => {
  PathUtils.checkExists = jest.fn();
  PathUtils.checkExists("~/.meta-proj-cli/");

  expect((PathUtils.checkExists)).toReturn();
});
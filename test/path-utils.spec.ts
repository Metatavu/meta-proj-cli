import { PathUtils } from "../src/classes/path-utils";

it('gets default paths', () => {
  expect((PathUtils.savePath())).toBeDefined();
  expect((PathUtils.projectPath())).toBeDefined();
});

it('fixes a path', () => {
  expect((PathUtils.fixPath("~/.meta-proj-cli/"))).toBeDefined();
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
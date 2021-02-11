import { ProjConfigUtils } from "../src/classes/proj-config-utils";
import { ProjConfigJson } from "../src/interfaces/types";

const mockPath = "/home/";
const mockProjConfig : ProjConfigJson = {
  "projectName" : ""
};

it("reads a project-config.json", async () => {
  ProjConfigUtils.readProjConfig = jest.fn();
  await ProjConfigUtils.readProjConfig(mockPath);

  expect(ProjConfigUtils.readProjConfig).toReturn();
});

it("writes to a project-config.json", async () => {
  ProjConfigUtils.writeProjConfig = jest.fn();
  await ProjConfigUtils.writeProjConfig(mockPath, JSON.stringify(mockProjConfig));

  expect(ProjConfigUtils.writeProjConfig).toReturn();
});

it("creates a project-config.json", async () => {
  ProjConfigUtils.createProjConfig = jest.fn();
  await ProjConfigUtils.createProjConfig(mockPath);

  expect(ProjConfigUtils.createProjConfig).toReturn();
});
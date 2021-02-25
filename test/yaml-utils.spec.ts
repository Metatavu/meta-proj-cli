import YamlUtils from "../src/classes/yaml-utils";

it("provides create yaml function", async () => {
  const args = {
    name:"test",
    image:"test",
    port:8088
  };
  YamlUtils.createYaml = jest.fn();
  await YamlUtils.createYaml(args, "pod", '');

  expect((YamlUtils.createYaml)).toReturn();
});

it("is able to read a .yaml file", async () => {
  YamlUtils.printYaml = jest.fn();
  await YamlUtils.printYaml("keycloak", "./resources");

  expect((YamlUtils.printYaml)).toReturn();
});

it("provides a delete yaml command string", async () => {
  const str = await YamlUtils.deleteYaml('deployment', '');

  expect((str)).toMatch(/deployment.yaml$/);
});

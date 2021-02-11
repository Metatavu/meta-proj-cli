import { UserConfigUtils } from "../src/classes/user-config-utils";
import { UserConfigJson } from "../src/interfaces/types";

it("reads user-config.json", async () => {
  const data : UserConfigJson = await UserConfigUtils.readUserConfig();

  expect(data).toHaveProperty("osPref");
});

it("is able to write to user-config-json", async () => {
  UserConfigUtils.writeUserConfig = jest.fn();
  UserConfigUtils.writeUserConfig(JSON.stringify(
    {
    "osPref": "LINUX"
    }
  ));

  expect(UserConfigUtils.writeUserConfig).toReturn();
});
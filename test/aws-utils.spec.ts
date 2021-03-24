import { AWSUtils } from "../src/classes/aws-utils";

it("returns config AWS commands", async () => {
  const strArr: string[] = await AWSUtils.configAWS("test", "access", "secret");

  expect((strArr[0])).toMatch(/^echo Writing "[meta-cli]" configuration...$/);
  expect((strArr[3])).toMatch(/^echo Configuring as Meta-cli$/);
});

it("returns create db instance command", () => {
  const createDB: string = AWSUtils.createDBInstance(
    "test",
    {
      password: "password",
      port: 3080,
      storage: 20,
      tag: {
        Key: "someKey",
        Value: "someValue"
      }
    }
  );
  expect((createDB)).toMatch(/^aws rds create-db-instance/);
});

it("returns Kubeconfig configuring command", () => {
  const configKube: string = AWSUtils.configKube("test");

  expect((configKube)).toMatch(/^aws eks --region us-east-2 update-kubeconfig --name test$/);
});
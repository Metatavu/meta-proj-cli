import * as CQ from "../src/commands/new-proj/create-quarkus";

it('returns a Maven command string', async () => {
  const str: string = await CQ.CreateQuarkus('test', false, false);

  expect((str)).toMatch(/^mvn io.quarkus:quarkus-maven-plugin/);
});

it('applies Kotlin setting', async () => {
  const str: string = await CQ.CreateQuarkus('test', true, false);

  expect((str)).toMatch(/kotlin/);
});

it('applies Gradle setting', async () => {
  const str: string = await CQ.CreateQuarkus('test', true, true);

  expect((str)).toMatch(/gradle/);
});

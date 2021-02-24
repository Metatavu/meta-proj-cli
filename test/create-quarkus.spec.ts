it('returns a Maven command string', async () => {
  const str: string = await CreateQuarkus('test', false, false);

  expect((str)).toMatch(/^mvn io.quarkus:quarkus-maven-plugin/);
});

it('applies Kotlin setting', () => {
  const str: string = await CreateQuarkus('test', true, false);

  expect((str)).toMatch(/kotlin/);
});

it('applies Gradle setting', () => {
  const str: string = await CreateQuarkus('test', true, true);

  expect((str)).toMatch(/gradle/);
});

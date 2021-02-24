it('returns a create react app command string', async () => {
  const str: string = await CreateReact('test');

  expect((str)).toMatch(/^npx create-react-app/);
});

it('returns clean react app command strings', async () => {
  const strArr: string[] = await CleanReact('', '');

  expect((strArr[0])).toMatch(/README.md/);
  expect((strArr[strArr.length - 1])).toMatch(/README.md/);
  expect ((strArr)).toHaveLength(11);
});

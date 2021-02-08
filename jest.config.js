module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { "\\.ts$": ["ts-jest"] },
  testRegex: "((\\.|/*.)(spec))\\.ts?$",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
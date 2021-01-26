import * as path from "path";

const { HOME } = process.env;

export const fixPath = (givenPath : string) => {
  givenPath = path.join(...givenPath.split(/\/|\\/));

  if (givenPath[0] === "~") {
    givenPath = path.join(HOME, givenPath.slice(1))
  } 

  if (givenPath[0] !== "/") {
    givenPath = path.sep + givenPath;
  } 

  return givenPath;
}
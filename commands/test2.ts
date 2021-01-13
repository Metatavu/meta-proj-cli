import * as Vorpal from "vorpal";

/**
 * shows, if this got piped data
 * 
 * @param args receives strings from stdin
 */
async function action(args) {
  if (args.stdin) {
    this.log(args.stdin + ` test2: received data`);
  }
  else {
    this.log(`test2: was not passed data`)
  }
}

/**
 * exports contents of file to be usable by main.ts
 */
export const test2 = (vorpal: Vorpal) => vorpal
  .command("test2", `shows if it got piped data`)
  .action(action);

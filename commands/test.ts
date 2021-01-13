//shows a debug command
function test(args, callback) {
    
    this.log(`test: succesful`);
    callback();

}

//exports contents of file to be usable by main.ts
module.exports = (vorpal) => {
    vorpal
        .command("test")
        .description(`Outputs a debug message`)
        .action(test);
}
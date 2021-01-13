//shows if it got piped data
function test2(args, callback) {

    if(args.stdin){
        this.log(args.stdin + ` test2: received data`);
    }
    else{
        this.log(`test2: was not passed data`)
    }
    callback();

}


//exports contents of file to be usable by main.ts
module.exports = (vorpal) => {

    vorpal
        .command("test2")
        .description(`concatenates it's status to end of string`)
        .action(test2);

}


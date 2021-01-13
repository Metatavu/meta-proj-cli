const vorpal = require( 'vorpal' )();


//shows propmt and accepts commands, redirects them to relevant files
vorpal
    .delimiter("meta-proj-cli~$:")
    .use(require("./commands/test.ts"))
    .use(require("./commands/test2.ts"))
    .show();

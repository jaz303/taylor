var fs          = require('fs');
var commands    = require('./lib/commands');
var Package     = require('./lib/Package');

var options = require('docopt').docopt(fs.readFileSync(__dirname + '/usage.txt', 'utf8'), {
    help        : true,
    version     : require('./package.json').version
});

var pkg = null;
try {
    pkg = Package.tryLoadFromDirectory(null, '.');
} catch (e) {
    console.error("error loading package!");
    console.error(e);
    process.exit(1);
}

var command = null;
for (var k in commands) {
    if (options[k]) {
        try {
            commands[k](pkg, options).catch(reportFinalError);    
        } catch (err) {
            reportFinalError(err);
        }
        break;
    }
}

function reportFinalError(err) {
    console.error(err.message);
    if (true) { // TODO: trace option in options
        console.error(err);
        console.error(err.stack);
    }
    process.exit(1);
}

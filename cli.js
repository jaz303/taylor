var fs          = require('fs');
var path        = require('path');
var commands    = require('./lib/commands');
var K           = require('./lib/constants');
var Package     = require('./lib/Package');

var options = require('docopt').docopt(fs.readFileSync(__dirname + '/usage.txt', 'utf8'), {
    help        : true,
    version     : require('./package.json').version
});

function packageLoadError(err) {
    console.error("error loading package metadata!");
    console.error(err);
    process.exit(1);
}

var parentPkg = null;
if (path.basename(fs.realpathSync('..')) === K.MODULES_DIR) {
    try {
        parentPkg = Package.tryLoadFromDirectory(null, '../..');
    } catch (e) { packageLoadError(e); }
}

var pkg = null;
try {
    pkg = Package.tryLoadFromDirectory(parentPkg, '.');
} catch (e) { packageLoadError(e); }

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

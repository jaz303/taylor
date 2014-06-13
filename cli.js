var fs          = require('fs');
var Package     = require('./lib/Package');

var options = require('docopt').docopt(fs.readFileSync(__dirname + '/usage.txt', 'utf8'), {
    help        : true,
    version     : require('./package.json').version
});

var commands = {
    'create'        : require('./lib/handlers/create_app'),
    'create-module' : require('./lib/handlers/create_module'),
    'install'       : require('./lib/handlers/install_package'),
    'build'         : require('./lib/handlers/build_package'),
    'regen'         : require('./lib/handlers/regenerate'),
    'config'        : require('./lib/handlers/dump_config'),
    'env'           : require('./lib/handlers/dump_environment')
};

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
        command = commands[k](pkg, options);
        break;
    }
}

command
    .then(function() {
        console.log("DONE!");
    })
    .catch(function(err) {
        console.error("ERROR");
        console.error(err);
        console.error(err.stack);
    });

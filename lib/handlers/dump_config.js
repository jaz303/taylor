module.exports = dumpConfig;

var Promise         = require('../Promise');
var serializeEnv    = require('../serialize_env');
var A               = require('../actions');

function dumpConfig(pkg, options) {
    return new Promise(function(resolve, reject) {

        A.getConfig().then(function(config) {
            process.stdout.write(serializeEnv(config));
            resolve();
        });

    });
}

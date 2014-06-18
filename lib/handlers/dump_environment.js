module.exports = dumpEnvironment;

var Promise         = require('../Promise');
var serializeEnv    = require('../serialize_env');
var A               = require('../actions');

function dumpEnvironment(pkg, options) {
    return new Promise(function(resolve, reject) {

        A.getEnvironment().then(function(env) {
            process.stdout.write(serializeEnv(env));
            resolve();
        });

    });
}

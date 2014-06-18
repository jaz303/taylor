module.exports = buildMakeTarget;

var spawn           = require('child_process').spawn;
var Promise         = require('../Promise');
var K               = require('../constants');
var getEnvironment  = require('./get_environment');

function buildMakeTarget(pkg, target) {
    return getEnvironment()
        .then(function(env) {
            return new Promise(function(resolve, reject) {

                var child = spawn('make', ['--file=' + K.MAKEFILE_NAME, target], {
                    cwd     : pkg.getAbsolutePath(),
                    env     : env,
                    stdio   : [
                        process.stdin,
                        'ignore',
                        process.stderr
                    ]
                });

                child.on('error', function(err) {
                    process.stderr.write(err);
                    reject();
                });

                child.on('close', function(code) {
                    if (code != '0') {
                        reject(new Error("make exited with code " + code));
                    } else {
                        resolve();
                    }
                });

            });
        });
}

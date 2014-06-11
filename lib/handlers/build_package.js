module.exports = buildPackage;

var config  = require('../config');
var K       = require('../constants');
var Promise = require('../Promise');

var spawn   = require('child_process').spawn;

function buildPackage(pkg, options) {
    return new Promise(function(resolve, reject) {

        if (!pkg) {
            throw new Error("package required!");
        }

        // base environment from config, but overridable via ENV
        // TODO: in the future it should be able to override configuration from
        // the parent package.
        var env = config.all();
        for (var k in process.env) {
            env[k] = process.env[k];
        }

        // TODO: injecting toolchain path should be optional step
        env.PATH = config.get('SWIFT_TOOLCHAIN') + '/usr/bin';
        if ('PATH' in env) {
            env.PATH += ':' + env.PATH;
        }

        var target = options['<target>'];
        target = target ? ('target_' + target) : 'all';

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
            console.error(err);
        });

        child.on('close', function(code) {
            console.log("make exited with code " + code);
            resolve();
        });

    });
}
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
        var toolchainPath = config.get('SWIFT_TOOLCHAIN') + '/usr/bin';
        if ('PATH' in env) {
            env.PATH = toolchainPath + ':' + env.PATH;
        } else {
            env.PATH = toolchainPath;
        }

        var child = spawn('make', ['--file=' + K.MAKEFILE_NAME, 'all'], {
            cwd: pkg.getAbsolutePath(),
            env: env
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
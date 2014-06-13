module.exports = getEnvironment;

var Promise 	= require('../Promise');
var getConfig	= require('./get_config');

/*
 * Returns a Promise that will be fulfilled with the compilation
 * environment within which make(1) will be executed.
 */
function getEnvironment() {
	return getConfig()
		.then(function(config) {

			var env = config;

			// Anything defined in user's environment takes precedence
			// over config.
			for (var k in process.env) {
				env[k] = process.env[k];
			}

			// Finally: inject toolchain path
			// TODO: should this be an optional step?
			var toolchainPath = env['SWIFT_TOOLCHAIN'] + '/usr/bin';
			if ('PATH' in env) {
				env.PATH = toolchainPath + ':' + env.PATH;
			} else {
				env.PATH = toolchainPath;
			}

			return env;

		});
}
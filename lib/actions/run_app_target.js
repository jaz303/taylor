module.exports = runAppTarget;

var spawn 	= require('child_process').spawn;
var Promise = require('../Promise');

function runAppTarget(pkg, target) {
	return new Promise(function(resolve, reject) {

		if (!target.isApp()) {
			throw new Error("specified target is not an app");
		}

		// TODO: support passing args
		var child = spawn(target.getRelativeProductFile(), [], {
			cwd		: pkg.getAbsolutePath(),
			stdio 	: [
				process.stdin,
				process.stdout,
				process.stderr
			]
		});

		child.on('close', function(code) {
			resolve();
		});

	});
}

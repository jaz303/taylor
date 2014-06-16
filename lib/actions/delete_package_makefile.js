module.exports = deletePackageMakefile;

var fs = require('fs');
var Promise = require('../Promise');

function deletePackageMakefile(pkg) {
	return new Promise(function(resolve, reject) {
		fs.unlink(pkg.getAbsoluteMakefilePath(), function(err) {
			if (err && err.code !== 'ENOENT') {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

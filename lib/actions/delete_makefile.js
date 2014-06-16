module.exports = deleteMakefile;

var fs = require('fs');
var Promise = require('../Promise');

function deleteMakefile(pkg) {
	return new Promise(function(resolve, reject) {
		fs.unlink(pkg.getAbsoluteMakefilePath(), function(err) {
			if (err && err.code !== 'ENOENT') {
				reject();
			} else {
				resolve();
			}
		});
	});
}

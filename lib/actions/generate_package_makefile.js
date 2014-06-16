module.exports = generatePackageMakefile;

var fs = require('fs');
var Promise = require('../Promise');

function generatePackageMakefile(pkg, force) {
	return new Promise(function(resolve, reject) {

		function write() {
			var makefile = pkg.generateMakefile();
			fs.writeFile(pkg.getAbsoluteMakefilePath(), makefile.generate(), {encoding: 'utf8'}, function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		}

		if (force) {
			write();
		} else {
			fs.exists(pkg.getAbsoluteMakefilePath(), function(exists) {
				if (!exists) {
					write();
				} else {
					resolve();
				}
			});
		}

	});
}
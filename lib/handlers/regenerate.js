module.exports = regeneratePackage;

var A = require('../actions');

function regeneratePackage(pkg, options) {
	return A.generatePackageMakefile(pkg, true);
}

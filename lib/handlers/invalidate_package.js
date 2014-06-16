module.exports = invalidatePackage;

var A = require('../actions');

function invalidatePackage(pkg, options) {

	return A.deletePackageMakefile(pkg);

}
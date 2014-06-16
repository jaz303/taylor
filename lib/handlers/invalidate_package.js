module.exports = invalidatePackage;

var A = require('../actions');

function invalidatePackage(pkg, options) {

	if (!pkg) {
		throw new Error("this command must be run in a package context");
	}

	return A.deleteMakefile(pkg);

}
module.exports = buildMakeTarget;

var A = require('../actions');

function buildMakeTarget(pkg, options) {

	if (!pkg) {
		throw new Error("this command must be run in a package context");
	}

	var target = options['<target>'];

	return A.buildMakeTarget(pkg, target);

}
module.exports = installPackage;

var Promise 	= require('../Promise');
var A 			= require('../actions');

function installPackage(pkg, options) {
	return new Promise(function(resolve, reject) {

		if (!pkg) {
			throw new Error("'install' must be run in the context of an existing package");
		}

		var packageToInstall 	= options['<module>'];
		var packageSource 		= null;
		
		return A.resolvePackage(packageToInstall)
			.then(function(pd) {
				packageSource = pd;
			})
			.then(function() {
				return A.createDirectory(pkg.getAbsoluteModulesPath());
			})
			.then(function() {
				if (packageSource.type === 'git') {
					return A.gitClonePackage(
						packageSource.url,
						pkg.getAbsoluteModulesPath()
					);
				} else {
					return new Error("unknown package source type: " + packageSource.type);
				}
			})
			.then(null, reject);

	});
}

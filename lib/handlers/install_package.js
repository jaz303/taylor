module.exports = installPackage;

var Promise 		= require('../Promise');
var Plan 			= require('../Plan');
var resolvePackage	= require('../resolve_package');

function installPackage(pkg, options) {
	return new Promise(function(resolve, reject) {

		if (!pkg) {
			throw new Error("'install' must be run in the context of an existing package");
		}

		var packageToInstall = options['<module>'];

		return resolvePackage(packageToInstall).then(function(packageUrl) {

			var plan = new Plan(pkg.getAbsolutePath());

			return plan
					.createDir('modules')
					.clonePackage(packageUrl, 'modules/$PACKAGE')
					.exec();
		
		});

	});
}

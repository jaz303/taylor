module.exports = createModule;

var A = require('../actions');

function createModule(pkg, options) {

    var path = pkg ? pkg.getAbsoluteModulesPath() : '';

    var prm = A.createPackage(options['<package>'], path, {
        app: false,
        targets: { module: { type: 'module' } }
    });

    if (pkg) {
        prm = prm.then(function() {
            return A.deletePackageMakefile(pkg);
        });
    }

    return prm;

}
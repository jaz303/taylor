module.exports = createModule;

var fs      = require('fs');
var creator = require('../creator');
var A       = require('../actions');

function createModule(pkg, options) {

    var path = pkg ? pkg.getAbsoluteModulesPath() : '.';
    
    var pkgName = options['<package>'];
    if (!pkgName) {
        throw new Error("package name is required");
    }

    return creator
        .createModule(path, pkgName)
        .then(function() {
            return A.deletePackageMakefile(pkg);
        });

}
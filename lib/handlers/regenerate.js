module.exports = regeneratePackage;

var fs = require('fs');
var Promise = require('../Promise');

function regeneratePackage(pkg, options) {
    return new Promise(function(resolve, reject) {

        if (!pkg) {
            throw new Error("package required");
        }

        var makefile = pkg.generateMakefile();
        var path = pkg.getAbsoluteMakefilePath();

        fs.writeFileSync(path, makefile.generate(), 'utf8');

        resolve();

    });
}
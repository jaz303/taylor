module.exports = regeneratePackage;

var Promise = require('../Promise');

function regeneratePackage(pkg, options) {
    return new Promise(function(resolve, reject) {

        if (!pkg) {
            throw new Error("package required");
        }

        var makefile = pkg.generateMakefile();

        console.log(makefile.generate());

        resolve();
        
    });
}
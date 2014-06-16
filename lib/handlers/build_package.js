module.exports = buildPackage;

var A = require('../actions');

function buildPackage(pkg, options) {

    var makeTarget = options['<target>'];
    makeTarget = makeTarget ? ('target_' + makeTarget) : 'all';

    return A.generatePackageMakefile(pkg, false)
        .then(function() {
            return A.buildMakeTarget(pkg, makeTarget);
        });

}
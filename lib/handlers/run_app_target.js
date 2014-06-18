module.exports = runAppTarget;

var A = require('../actions');

function runAppTarget(pkg, options) {
    var target = options['<target>'];
    return A.runAppTarget(pkg, target ? pkg.getTargetById(target) : pkg.getAppTarget());
}
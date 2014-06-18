module.exports = buildMakeTarget;

var A = require('../actions');

function buildMakeTarget(pkg, options) {

    var target = options['<target>'];

    return A.buildMakeTarget(pkg, target);

}
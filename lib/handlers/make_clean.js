module.exports = makeClean;

var A = require('../actions');

function makeClean(pkg, options) {
    return A.buildMakeTarget(pkg, 'clean');
}
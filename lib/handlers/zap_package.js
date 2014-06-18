module.exports = zapPackage;

var A = require('../actions');

function zapPackage(pkg, options) {

    return A.deleteAllArtifacts(pkg);

}
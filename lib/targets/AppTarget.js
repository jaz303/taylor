module.exports = AppTarget;

function AppTarget(id, package, opts) {
    this.id = id;
    this.package = package;
}

AppTarget.prototype.isModule = function() {
    return false;
}

AppTarget.prototype.isApp = function() {
    return true;
}

AppTarget.prototype.generateMakefile = function(makefile) {

}

module.exports = AppTarget;

function AppTarget(id, package, opts) {
    this.id = id;
    this.package = package;
}

AppTarget.prototype.generateMakefile = function(makefile) {

}

module.exports = Context;

function Context() {

}

Context.prototype.getSwiftCompileFlags = function() {
    var flags = "";
    flags += " -target " + this.getTarget();
    flags += " -sdk " + this.getSDK();
    flags += " -I " + this.getCompiledModulesDir();
}

Context.prototype.getArch = function() {
    return 'x86_64';
}

Context.prototype.getTarget = function() {
    return this.getArch() + '-apple-macosx10.9';
}

module.exports = ModuleTarget;

var K = require('../constants');

function ModuleTarget(id, package, opts) {
    this.id = id;
    this.package = package;
    this.name = opts.name;
}

ModuleTarget.prototype.isModule = function() {
    return true;
}

ModuleTarget.prototype.isApp = function() {
    return false;
}

ModuleTarget.prototype.getName = function() {
    return this.name || this.package.getName();
}

ModuleTarget.prototype.getUmbrellaTarget = function() {
    return 'target_' + this.id;
}

ModuleTarget.prototype.getLibraryFilename = function() {
    return this.getName() + '.dylib';
}

ModuleTarget.prototype.getModuleFilename = function() {
    return this.getName() + '.swiftmodule';
}

ModuleTarget.prototype.getObjectiveCHeaderPath = function() {
    return this.getName() + '-Swift.h';
}

ModuleTarget.prototype.getRelativeLibraryPath = function() {
    return this._relativePath(this.getLibraryFilename());
}

ModuleTarget.prototype.getRelativeModulePath = function() {
    return this._relativePath(this.getModuleFilename());
}

ModuleTarget.prototype.getRelativeObjectiveCHeaderPath = function() {
    return this._relativePath(this.getObjectiveCHeaderPath());   
}

ModuleTarget.prototype.generateMakefile = function(makefile) {

    var lib = this.getRelativeLibraryPath(),
        mod = this.getRelativeModulePath();

    makefile.comment('Target: ' + this._name);

    makefile.target(this.getUmbrellaTarget())
        .dep(lib)
        .dep(mod);

    makefile.target(lib)
        .dep('build')
        .dep('$(SRC)')
        .lines([
            "swift \\",
            "    -target $(" + K.ENV_KEY_TARGET + ") -sdk $(" + K.ENV_KEY_SDK + ") -O0 -g -j4 \\",
            "    -emit-library \\",
            "    -o $@ \\",
            "    $(SRC)"
        ]);

    makefile.target(mod)
        .dep('build')
        .dep('$(SRC)')
        .lines([
            "swift \\",
            "    -c \\",
            "    -target $(" + K.ENV_KEY_TARGET + ") -sdk $(" + K.ENV_KEY_SDK + ") -O0 -g -j4 \\",
            "    -module-name " + this.getName() + " \\",
            "    -emit-dependencies \\",
            "    -emit-module \\",
            "    -emit-module-path " + mod + " \\",
            "    -emit-objc-header \\",
            "    -emit-objc-header-path " + this.getRelativeObjectiveCHeaderPath() + " \\",
            "    $(SRC)"
        ]);

}

//
// 

ModuleTarget.prototype._relativePath = function(filename) {
    return 'build/' + filename;
}
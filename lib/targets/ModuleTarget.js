module.exports = ModuleTarget;

var K                       = require('../constants');
var generateModuleTarget    = require('../generate_module_target');

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
    generateModuleTarget(makefile, {
        name            : this.getName(),
        umbrellaTarget  : this.getUmbrellaTarget(),
        libraryDir      : 'build',
        moduleDir       : 'build',
        sourceFiles     : '$(SRC)'
    });
}

//
// 

ModuleTarget.prototype._relativePath = function(filename) {
    return 'build/' + filename;
}
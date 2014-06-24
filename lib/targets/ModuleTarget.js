module.exports = ModuleTarget;

var join                    = require('path').join;
var K                       = require('../constants');
var generateModuleTarget    = require('../generate_module_target');

function ModuleTarget(id, package, opts) {
    this.id = id;
    this.package = package;
    this.name = opts.name;
    this.requires = opts.requires || [];
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
    return 'lib' + this.getName() + '.dylib';
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

    var targetRoot  = this._targetRoot();

    makefile.comment('Product directories');
    makefile.dir(targetRoot);

    generateModuleTarget(makefile, {
        name            : this.getName(),
        umbrellaTarget  : this.getUmbrellaTarget(),
        moduleDir       : targetRoot,
        libraryDir      : targetRoot,
        importPath      : targetRoot,
        libraryPath     : targetRoot,
        libraries       : this.requires,
        sourceFiles     : '$(SRC)'
    });

    makefile.clean.line(
        'rm -f ' + targetRoot + '/*' + this.getName() + '*'
    );

}

//
//

ModuleTarget.prototype._targetRoot = function() {
    return join(
        this.package.parent ? '../../' : '',
        K.BUILD_DIR,
        'modules'
    );
}

ModuleTarget.prototype._relativePath = function(filename) {
    return join(this._targetRoot(), filename);
}
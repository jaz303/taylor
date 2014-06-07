var fs = require('fs');

function expandTemplate(__tpl, mod, ctx) {
    return __tpl.replace(/\{\{\}\}/g, function(m) {
        return eval(m[1]);
    });
}

var Module = module.exports = function(ctx, name) {
    this.ctx = ctx;
    this.name = name;
}

Module.prototype.generateMakefile = function() {

    var template = fs.readFileSync(__dirname + '/makefile_template', 'utf8');
    var makefile = expandTemplate(template, this, this.ctx);

}

Module.prototype.getLibraryFilename = function() {
    return this.name + '.swiftmodule';
}

Module.prototype.getModuleFilename = function() {
    return this.name + '.dylib';
}

Module.prototype.getSwiftCompileFlags = function() {
    var flags = this.ctx.getSwiftCompileFlags();
    flags += " -g";
    flags += " -O" + this.getOptimizationLevel();
}

Module.prototype.getSwiftSourceFiles = function() {

}

Module.prototype.getSwiftObjCHeaderFilename = function() {
    return this.name + '-Swift.h';
}

Module.prototype.getOptimizationLevel = function() {
    return 0;
}
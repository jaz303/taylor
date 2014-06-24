module.exports = AppTarget;

var join                    = require('path').join;
var K                       = require('../constants');
var generateModuleTarget    = require('../generate_module_target');

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

AppTarget.prototype.getName = function() {
    return 'app';
}

// Path to final app executable
AppTarget.prototype.getRelativeProductFile = function() {
    return join(this._getRelativeBuildRoot(), this.id);
}

AppTarget.prototype.getUmbrellaTarget = function() {
    return 'target_' + this.id;
}

AppTarget.prototype.generateMakefile = function(makefile) {

    var mainModuleName      = this.id + '_main';
    var modulesOutputDir    = 'build/modules';

    // Submodules
    var modules = this.package.getInstalledModules();

    // Top-level build target
    var umb = makefile.target(this.getUmbrellaTarget(), {phony: true});
    
    //
    // Step 0 - product directories

    makefile.dir(this._getRelativeBuildRoot());
    makefile.dir(modulesOutputDir);
    
    //
    // Step 1 - build submodules

    var mods = makefile.target(umb.getName() + '_modules', {phony: true});

    modules.forEach(function(mod) {
        var modTarget = this._generateModuleMakefile(makefile, mod);
        mods.dep(modTarget);
    }, this);

    //
    // Step 2 - build generate target for the main module code

    var main = generateModuleTarget(makefile, {
        name            : mainModuleName,
        umbrellaTarget  : mainModuleName,
        moduleDir       : modulesOutputDir,
        libraryDir      : modulesOutputDir,
        importPath      : modulesOutputDir,
        libraryPath     : modulesOutputDir,
        libraries       : modules.map(function(mod) { return mod.getModuleTarget().getName(); }),
        sourceFiles     : '$(SRC)'
    });

    main.dep(mods);

    //
    // Step 3 - link

    makefile.comment('Link');

    var modList = modules.map(function(mod) {
        return ' -l' + mod.getModuleTarget().getName();
    }).join('');

    var link = makefile.target(this.getRelativeProductFile())
        .dep(mods)
        .dep(main)
        .dep(this._getRelativeBuildRoot())
        .lines([
            "echo \"import " + mainModuleName + ";\\nMain();\\n\" > .entry.swift",
            "swift \\",
            "    -target $(" + K.ENV_KEY_TARGET + ") -sdk $(" + K.ENV_KEY_SDK + ") -O0 -g -j4 \\",
            "    -I " + modulesOutputDir + " \\",
            "    -L " + modulesOutputDir + " \\",
            "    -l" + mainModuleName + modList + " \\",
            "    -Xlinker -rpath -Xlinker @executable_path/../modules \\",
            "    -o $@ \\",
            "    .entry.swift",
            "rm -f .entry.swift"
        ]);

    umb.dep(link);

    //
    // Step 4 - clean

    makefile.clean.lines([
        'rm -rf ' + this._getRelativeBuildRoot(),
        'rm -f ' + modulesOutputDir + '/*' + mainModuleName + '*'
    ]);

}

AppTarget.prototype._generateModuleMakefile = function(makefile, mod) {

    function r(path) {
        return path.replace('../../', '');
    }

    var tgt = mod.getModuleTarget();

    makefile.comment('Module: ' + tgt.getName());

    // Umbrella target for this module
    var umb = makefile.target('module_' + tgt.getName(), {phony: true});

    // Umbrella needs to depend on all of modules "dependencies"
    // FIXME: this is not well thought-out; it should work with actual module instances
    tgt.requires.forEach(function(moduleName) {
        umb.dep('module_' + moduleName);
    });

    // Make the module makefile
    var moduleMakefilePath = mod.getAbsoluteMakefilePath();
    umb.dep(moduleMakefilePath);
    makefile.target(moduleMakefilePath)
        .lines([
            "cd " + mod.getAbsolutePath() + " && taylor regen"
        ]);

    // Make the module
    var moduleModulePath = r(tgt.getRelativeModulePath());
    umb.dep(moduleModulePath);
    makefile.target(moduleModulePath)
        .lines([
            "make -C " + mod.getAbsolutePath() + " --makefile=" + K.MAKEFILE_NAME + " " + tgt.getRelativeModulePath()
        ]);

    // Make the dylib
    var moduleDylibPath = r(tgt.getRelativeLibraryPath());
    umb.dep(moduleDylibPath);
    makefile.target(moduleDylibPath)
        .lines([
            "make -C " + mod.getAbsolutePath() + " --makefile=" + K.MAKEFILE_NAME + " " + tgt.getRelativeLibraryPath()
        ]);

    return umb;

}

//

AppTarget.prototype._getRelativeBuildRoot = function() {
    return join(K.BUILD_DIR, this.id);
}

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

    // Submodules
    var modules = this.package.getInstalledModules();

    // Top-level build target
    var umb  = makefile.target(this.getUmbrellaTarget(), {phony: true});
    
    //
    // Step 0 - product directories

    this._getRelativeProductPaths().forEach(function(bp) {
        makefile.target(bp).line("mkdir -p " + bp);
    });

    //
    // Step 1 - build submodules

    var mods = makefile.target(umb.getName() + '_modules', {phony: true});

    modules.forEach(function(mod) {
        var modTarget = this._generateModuleMakefile(makefile, mod);
        mods.dep(modTarget);
    }, this);

    //
    // Step 2 - build generate target for the main module code

    var mainModuleName = this.id + '_main';

    var main = generateModuleTarget(makefile, {
        name            : mainModuleName,
        umbrellaTarget  : mainModuleName,
        moduleDir       : this._getRelativeModuleBuildPath(),
        libraryDir      : this._getRelativeLibraryBuildPath(),
        importPath      : this._getRelativeModuleBuildPath(),
        libraryPath     : this._getRelativeLibraryBuildPath(),
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
            "    -I " + this._getRelativeModuleBuildPath() + " \\",
            "    -L " + this._getRelativeLibraryBuildPath() + " \\",
            "    -l" + mainModuleName + modList + " \\",
            "    -Xlinker -rpath -Xlinker @executable_path/" + this._getLibraryDirName() + " \\",
            "    -o $@ \\",
            "    .entry.swift",
            "rm -f .entry.swift"
        ]);

    umb.dep(link);

    //
    // stdlib

    // var stdlibPath = join(this._getRelativeLibraryBuildPath(), K.STDLIB_NAME);
    // var stdlib = makefile.target(stdlibPath)
    //                 .dep(this._getRelativeLibraryBuildPath())
    //                 .line('cp $(' + K.ENV_KEY_TOOLCHAIN + ')/usr/lib/swift/macosx/' + K.STDLIB_NAME + ' ' + stdlibPath);
    
    // main.dep(stdlib);

}

AppTarget.prototype._generateModuleMakefile = function(makefile, mod) {

    function relativize(path) {
        return path;
    }

    function r(path) {
        return relativize(join(mod.getAbsolutePath(), path));
    }

    var tgt = mod.getModuleTarget();

    makefile.comment('Module: ' + tgt.getName());

    // Umbrella target for this module
    var umb = makefile.target('module_' + tgt.getName(), {phony: true});

    // Make the module makefile
    var moduleMakefilePath = relativize(mod.getAbsoluteMakefilePath());
    umb.dep(moduleMakefilePath);
    makefile.target(moduleMakefilePath)
        .lines([
            "cd " + relativize(mod.getAbsolutePath()) + " && taylor regen"
        ]);

    // Make the module
    var moduleModulePath = r(tgt.getRelativeModulePath());
    makefile.target(moduleModulePath)
        .lines([
            "make -C " + relativize(mod.getAbsolutePath()) + " --makefile=" + K.MAKEFILE_NAME + " " + tgt.getRelativeModulePath()
        ]);

    // Make the dylib
    var moduleDylibPath = r(tgt.getRelativeLibraryPath());
    makefile.target(moduleDylibPath)
        .lines([
            "make -C " + relativize(mod.getAbsolutePath()) + " --makefile=" + K.MAKEFILE_NAME + " " + tgt.getRelativeLibraryPath()
        ]);
    
    // Create symlink to module
    // TODO: don't hardcode number of parent directory traversals
    var moduleLink = join(this._getRelativeModuleBuildPath(), tgt.getModuleFilename());
    umb.dep(moduleLink);
    makefile.target(moduleLink)
        .dep(moduleModulePath)
        .dep(this._getRelativeModuleBuildPath())
        .lines([
            "cd " + this._getRelativeModuleBuildPath() + " && ln -fs ../../../" + moduleModulePath
        ]);

    // Create symlink to module
    // TODO: don't hardcode number of parent directory traversals
    var libLink = join(this._getRelativeLibraryBuildPath(), tgt.getLibraryFilename());
    umb.dep(libLink);
    makefile.target(libLink)
        .dep(moduleDylibPath)
        .dep(this._getRelativeLibraryBuildPath())
        .lines([
            "cd " + this._getRelativeLibraryBuildPath() + " && ln -fs ../../../" + moduleDylibPath
        ]);

    return umb;

}

//

AppTarget.prototype._getRelativeBuildRoot = function() {
    return join('build', this.id);
}

AppTarget.prototype._getLibraryDirName = function() {
    return 'lib';
}

AppTarget.prototype._getRelativeModuleBuildPath = function() {
    return join(this._getRelativeBuildRoot(), 'module');
}

AppTarget.prototype._getRelativeLibraryBuildPath = function() {
    return join(this._getRelativeBuildRoot(), this._getLibraryDirName());
}

AppTarget.prototype._getRelativeProductPaths = function() {
    return [
        this._getRelativeBuildRoot(),
        this._getRelativeModuleBuildPath(),
        this._getRelativeLibraryBuildPath()
    ];
}
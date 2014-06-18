module.exports = AppTarget;

var join    = require('path').join;
var K       = require('../constants');

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

AppTarget.prototype.getRelativeBuildRoot = function() {
    return join('build', this.id);
}

AppTarget.prototype.getLibraryDirName = function() {
    return 'lib';
}

AppTarget.prototype.getRelativeProductFile = function() {
    return join(this.getRelativeBuildRoot(), this.id);
}

AppTarget.prototype.getRelativeModuleBuildPath = function() {
    return join(this.getRelativeBuildRoot(), 'module');
}

AppTarget.prototype.getRelativeLibraryBuildPath = function() {
    return join(this.getRelativeBuildRoot(), this.getLibraryDirName());
}

AppTarget.prototype.getRelativeProductPaths = function() {
    return [
        this.getRelativeBuildRoot(),
        this.getRelativeModuleBuildPath(),
        this.getRelativeLibraryBuildPath()
    ];
}

AppTarget.prototype.getUmbrellaTarget = function() {
    return 'target_' + this.id;
}

AppTarget.prototype.generateMakefile = function(makefile) {

    makefile.comment('Helpers');

    //
    // build .o from .swift

    makefile.pattern('o', 'swift')
        .lines([
            "swift \\",
            "    -target $(" + K.ENV_KEY_TARGET + ") -sdk $(" + K.ENV_KEY_SDK + ") -O0 -g -j4 \\",
            "    -I " + this.getRelativeModuleBuildPath() + " \\",
            "    -c -o $@ $<"
        ]);

    makefile.comment('Target: app');

    //
    // build product directories

    this.getRelativeProductPaths().forEach(function(bp) {
        makefile.target(bp).line("mkdir -p " + bp);
    });

    // make target to build entire app
    var umb = makefile.target(this.getUmbrellaTarget(), {phony: true});
    
    var main = makefile.target(umb.getName() + '_main', {phony: true});
    umb.dep(main);

    // make target to build all installed modules
    var mods = makefile.target(umb.getName() + '_modules', {phony: true});
    
    // main source
    var obj = makefile.target(umb.getName() + '_obj', {phony: true});
    obj.dep('$(OBJ)');

    //
    // linking!

    var link = makefile.target(this.getRelativeProductFile())
        .dep(mods)
        .dep(obj)
        .dep(this.getRelativeBuildRoot())
        .lines([
            "clang \\",
            "    -arch $(" + K.ENV_KEY_ARCH + ") \\",
            "    -isysroot $(" + K.ENV_KEY_SDK + ") \\",
            "    -mmacosx-version-min=10.9 \\",
            "    -lswift_stdlib_core \\",
            "    -L$(" + K.ENV_KEY_TOOLCHAIN + ")/usr/lib/swift/macosx \\",
            "    -Xlinker -force_load -Xlinker $(" + K.ENV_KEY_TOOLCHAIN + ")/usr/lib/arc/libarclite_macosx.a \\",
            "    -Xlinker -rpath -Xlinker @executable_path/" + this.getLibraryDirName() + " \\"
        ]);

    main.dep(link);

    //
    // stdlib

    var stdlibPath = join(this.getRelativeLibraryBuildPath(), K.STDLIB_NAME);
    var stdlib = makefile.target(stdlibPath)
                    .dep(this.getRelativeLibraryBuildPath())
                    .line('cp $(' + K.ENV_KEY_TOOLCHAIN + ')/usr/lib/swift/macosx/' + K.STDLIB_NAME + ' ' + stdlibPath);
    
    main.dep(stdlib);

    var modules = this.package.getInstalledModules();

    modules.forEach(function(mod) {

        var modModPath = join(
            this.getRelativeModuleBuildPath(),
            mod.getModuleTarget().getModuleFilename()
        );

        link.lines([
            "    -Xlinker -sectalign -Xlinker __SWIFT -Xlinker __ast -Xlinker 4 \\",
            "    -Xlinker -sectcreate -Xlinker __SWIFT -Xlinker __ast -Xlinker " + modModPath + " \\"
        ]);

    }, this);

    modules.forEach(function(mod) {
        
        var modLibPath = join(
            this.getRelativeLibraryBuildPath(),
            mod.getModuleTarget().getLibraryFilename()
        );

        link.line("    " + modLibPath + " \\");
    
    }, this);

    link.lines([
        "    $(OBJ) \\",
        "    -o " + this.getRelativeProductFile()
    ]);

    //
    // build modules

    modules.forEach(function(mod) {
        var modTarget = this._generateModuleMakefile(makefile, mod);
        mods.dep(modTarget);
    }, this);

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
    var moduleLink = join(this.getRelativeModuleBuildPath(), tgt.getModuleFilename());
    umb.dep(moduleLink);
    makefile.target(moduleLink)
        .dep(moduleModulePath)
        .dep(this.getRelativeModuleBuildPath())
        .lines([
            "cd " + this.getRelativeModuleBuildPath() + " && ln -fs ../../../" + moduleModulePath
        ]);

    // Create symlink to module
    // TODO: don't hardcode number of parent directory traversals
    var libLink = join(this.getRelativeLibraryBuildPath(), tgt.getLibraryFilename());
    umb.dep(libLink);
    makefile.target(libLink)
        .dep(moduleDylibPath)
        .dep(this.getRelativeLibraryBuildPath())
        .lines([
            "cd " + this.getRelativeLibraryBuildPath() + " && ln -fs ../../../" + moduleDylibPath
        ]);

    return umb;

}
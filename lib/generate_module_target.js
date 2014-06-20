module.exports = generateModuleTarget;

var join        = require('path').join;
var basename    = require('path').basename;
var K           = require('./constants');

/*
 * Augments a makefile with targets to build a Swift module.
 *
 * The makefile should already have rules in place for creating the necessary
 * target directories.
 *
 * opts keys:
 *   name               : name of module to generate
 *   umbrellaTarget     : name of top-level make target
 *   libraryDir         : target directory for .dylib
 *   libraryPath        : path to search for linked libraries (optional)
 *   libraries          : array of libraries to link against (optional).
 *                        'lib' prefix and '.dylib' suffix must be omitted.
 *   moduleDir          : target directory for .swiftmodule
 *   importPath         : path to search for imported modules (optional)
 *   sourceFiles        : array of source files.
 *                        can also be a makefile compatiable string.
 *                        e.g. "foo.swift bar.swift baz.swift" or "$(SRC)"
 */
function generateModuleTarget(makefile, opts) {

    var libDir  = opts.libraryDir,
        libFile = join(libDir, 'lib' + opts.name + '.dylib'),
        modDir  = opts.moduleDir,
        modFile = join(modDir, opts.name + '.swiftmodule'),
        source  = Array.isArray(opts.sourceFiles)
                    ? opts.sourceFiles.join(' ')
                    : ('' + opts.sourceFiles);

    var importPath = null;
    if ('importPath' in opts) {
        importPath = "    -I " + opts.importPath + " \\";
    }

    var libraryPath = null;
    if ('libraryPath' in opts) {
        libraryPath = "    -L " + opts.libraryPath + " \\";
    }

    var libraries = null;
    if (('libraries' in opts) && opts.libraries.length) {
        libraries = "    " + opts.libraries.map(function(l) { return '-l' + l; }).join(' ') + " \\";
    }

    makefile.comment('Target: ' + opts.name);

    var umbrella = makefile.target(opts.umbrellaTarget, {phony: true})
                            .dep(libFile)
                            .dep(modFile);

    makefile.target(libFile)
        .dep(libDir)
        .dep(source)
        .lines([
            "swift \\",
            "    -target $(" + K.ENV_KEY_TARGET + ") -sdk $(" + K.ENV_KEY_SDK + ") -O0 -g -j4 \\",
            "    -emit-library \\",
            "    -module-name " + opts.name + " \\",
            importPath,
            libraryPath,
            libraries,
            "    -o $@ \\",
            "    " + source,
            "install_name_tool -id @rpath/" + basename(libFile) + " " + libFile
        ]);

    makefile.target(modFile)
        .dep(modDir)
        .dep(source)
        .lines([
            "swift \\",
            "    -target $(" + K.ENV_KEY_TARGET + ") -sdk $(" + K.ENV_KEY_SDK + ") -O0 -g -j4 \\",
            "    -module-name " + opts.name + " \\",
            "    -emit-dependencies \\",
            "    -emit-module \\",
            "    -emit-module-path $@ \\",
            importPath,
            //"    -emit-objc-header \\",
            //"    -emit-objc-header-path " + this.getRelativeObjectiveCHeaderPath() + " \\",
            "    " + source
        ]);

    return umbrella;

}
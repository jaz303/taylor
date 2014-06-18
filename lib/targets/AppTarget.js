module.exports = AppTarget;

var join 	= require('path').join;
var K		= require('../constants');

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

AppTarget.prototype.getRelativeBuildPath = function() {
	return join('build', this.id);
}

AppTarget.prototype.getRelativeModuleBuildPath = function() {
	return join(this.getRelativeBuildPath(), 'module');
}

AppTarget.prototype.getRelativeLibraryBuildPath = function() {
	return join(this.getRelativeBuildPath(), 'lib');
}

AppTarget.prototype.getRelativeBuildPaths = function() {
	return [
		this.getRelativeModuleBuildPath(),
		this.getRelativeLibraryBuildPath()
	];
}

AppTarget.prototype.getUmbrellaTarget = function() {
	return 'target_' + this.id;
}

AppTarget.prototype.generateMakefile = function(makefile) {

	makefile.comment('Target: app');

	// make target to build entire app
	var umb = makefile.target(this.getUmbrellaTarget(), {phony: true});

	// make target to build all installed modules
	var mods = makefile.target(umb.getName() + '_modules', {phony: true});

	// app depends on modules
	umb.dep(mods);

	//
	// build product directories

	this.getRelativeBuildPaths().forEach(function(bp) {
		makefile.target(bp).line("mkdir -p " + bp);
	});

	//
	// build modules

	this.package.getInstalledModules().forEach(function(mod) {
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
	// var moduleMakefilePath = relativize(mod.getAbsoluteMakefilePath());
	// umb.dep(moduleMakefilePath);
	// makefile.target(moduleMakefilePath)
	// 	.lines([
	// 		"cd " + relativize(mod.getAbsolutePath()) + " && taylor regen"
	// 	]);

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
			"cd " + this.getRelativeModuleBuildPath() + " && ln -s ../../../" + moduleModulePath
		]);

	// Create symlink to module
	// TODO: don't hardcode number of parent directory traversals
	var libLink = join(this.getRelativeLibraryBuildPath(), tgt.getLibraryFilename());
	umb.dep(libLink);
	makefile.target(libLink)
		.dep(moduleDylibPath)
		.dep(this.getRelativeLibraryBuildPath())
		.lines([
			"cd " + this.getRelativeLibraryBuildPath() + " && ln -s ../../../" + moduleDylibPath
		]);

	return umb;

}
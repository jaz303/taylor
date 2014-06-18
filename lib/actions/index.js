module.exports = {
	buildMakeTarget 		: require('./build_make_target'),
	createDirectory 		: require('./create_directory'),
	deleteAllArtifacts 		: require('./delete_all_artifacts'),
	deletePackageMakefile	: require('./delete_package_makefile'),
	generatePackageMakefile	: require('./generate_package_makefile'),
	getConfig 				: require('./get_config'),
	getEnvironment 			: require('./get_environment'),
	gitClonePackage			: require('./git_clone_package'),
	resolvePackage			: require('./resolve_package')
};
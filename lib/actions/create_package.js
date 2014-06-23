module.exports = createPackage;

var join 		= require('path').join;
var K 			= require('../constants');
var Promise 	= require('../Promise');
var createDir	= require('./create_directory');
var writeFile 	= require('./write_file');

function createPackage(packageName, targetDirectory, options) {
    return new Promise(function(resolve, reject) {

    	options = options || {};

    	var packageRoot = join(targetDirectory, packageName);
    	function j(component) { return join(packageRoot, component); }

    	var packageJson = {
    		name 	: packageName,
    		targets	: options.targets || {}
    	};

    	var prm = Promise.resolve();

    	prm = prm.then(function() {
    		return createDir(packageRoot);
    	}).then(function(exists) {
    		
    		if (exists)
    			return reject(new Error("can't create package - directory already exists"));
    		
    		return writeFile(
    			j(K.PACKAGE_JSON_NAME),
    			JSON.stringify(packageJson, null, 4) + "\n"
    		);

    	}).then(function() {
    		return writeFile(
    			j('.gitignore'), [
    				K.BUILD_DIR,
    				K.MAKEFILE_NAME,
    				K.ENTRY_FILE_NAME + "\n"
    			]
    		);
    	}).then(function() {
    		return createDir(j(K.SRC_DIR));
    	}).then(function() {
    		if (options.app) {
    			return writeFile(
    				j(K.SRC_DIR + '/main.swift'), [
    					"func Main() -> Int {",
    					"    println(\"Hello world!\");",
    					"    return 0;",
    					"}\n"
    				]
    			);
    		} else {
    			return writeFile(
    				j(K.SRC_DIR + '/main.swift'), [
    					"func exported() -> Int {",
    					"    return 0;",
    					"}\n"
    				]
    			);
    		} 
    	}).then(resolve);

    	return prm;

    });
}

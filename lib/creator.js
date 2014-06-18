exports.createApp		= createApp;
exports.createModule	= createModule;

function createApp(path, name) {
	return createPackage(path, name, {
		targets: {
			app: { type: "app" }
		}
	});
}

function createModule(path, name) {
	return createPackage(path, name, {
		targets: {
			module: { type: "module" }
		}
	});
}

//
//

var fs 		= require('fs');
var dirname	= require('path').dirname;
var K 		= require('./constants');
var Promise	= require('./Promise');

function createPackage(path, name, options) {
	return new Promise(function(resolve, reject) {

		var packageJson = {
			name: name,
			targets: options.targets
		};

		var steps = [];

		var pathComponent = path;
		while (pathComponent !== '.' && !fs.existsSync(pathComponent)) {
			steps.unshift({ dir: pathComponent, absolute: true });
			pathComponent = dirname(pathComponent);
		}

		steps = steps.concat([
			{ dir 	: name },
			{ file 	: name + '/' + K.PACKAGE_JSON_NAME, contents: JSON.stringify(packageJson, null, 4) },
			{ file 	: name + '/.gitignore', contents: "*.o\nbuild\nMakefile.taylor\n" },
			{ dir 	: name + '/src' },
			{ file 	: name + '/src/main.swift', contents: 'println("Hello world");\n' }
		]);

		try {

			function dir(step) {
				var dirPath = step.dir;
				if (!step.absolute) {
					dirPath = path + '/' + dirPath;	
				}
				if (fs.existsSync(dirPath)) {
					throw new Error("file " + step.dir + " already exists");
				} else {
					fs.mkdirSync(dirPath);
				}
			}

			function file(step) {
				var filePath = step.file;
				if (!step.absolute) {
					filePath = path + '/' + filePath;	
				}
				if (fs.existsSync(filePath)) {
					throw new Error("file " + step.file + " already exists");
				} else {
					fs.writeFileSync(filePath, step.contents);
				}	
			}

			steps.forEach(function(s) {
				if (s.dir) {
					dir(s);
				} else if (s.file) {
					file(s);
				}
			});

			setTimeout(resolve, 0);

		} catch (e) {
			throw new Error("error creating package: " + e.message);
		}

	});
}
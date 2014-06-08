var fs 			= require('fs');
var Project 	= require('./lib/Project');

var options = require('docopt').docopt(fs.readFileSync(__dirname + '/usage.txt', 'utf8'), {
    help        : true,
    version     : require('./package.json').version
});

var commands = {
	'create' 		: require('./lib/handlers/create_project'),
	'create-module'	: require('./lib/handlers/create_module'),
	'install' 		: require('./lib/handlers/install_module'),
	'build' 		: require('./lib/handlers/build_project')
};

var project = null;
try {
	project = Project.tryLoadFromDirectory(null, '.');
} catch (e) {
	console.error("error loading project!");
	console.error(e);
}

if (project) {
	console.log("in a project!");
}

for (var k in commands) {
	if (options[k]) {
		commands[k]();
		break;
	}
}

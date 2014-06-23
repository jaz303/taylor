module.exports = writeFile;

var fs = require('fs');
var Promise = require('../Promise');

function writeFile(path, contents) {
	
	if (Array.isArray(contents)) {
		contents = contents.join("\n");
	}
    
    return new Promise(function(resolve, reject) {
		fs.writeFile(path, contents, function(err) {
        	if (err) return reject(err);
        	resolve();
        });
	});
	
}

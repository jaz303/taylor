module.exports = createDirectory;

var fs = require('fs');
var Promise = require('../Promise');

function createDirectory(dirName) {
    return new Promise(function(resolve, reject) {

        fs.mkdir(dirName, function(err) {
            if (err && err.code !== 'EEXIST') {
                reject(err);
            } else {
                resolve();
            }
        });

    });
}

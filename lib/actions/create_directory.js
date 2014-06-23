module.exports = createDirectory;

var fs      = require('fs');
var path    = require('path');
var Promise = require('../Promise');

function createDirectory(dirName) {
    return new Promise(function(resolve, reject) {

        if (!dirName) return resolve();

        var chunks = dirName.split(path.sep);

        (function next(p) {
            fs.mkdir(p, function(err) {
                if (err && err.code !== 'EEXIST') return reject(err);
                if (chunks.length === 0) return resolve();
                next(path.join(p, chunks.shift()));
            });
        })(chunks.shift());

    });
}

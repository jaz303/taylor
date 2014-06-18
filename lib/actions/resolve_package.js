module.exports = resolvePackage;

var Promise = require('../Promise');

// TODO: this needs to support many many more sources
function resolvePackage(url) {
    return new Promise(function(resolve, reject) {
        if (url.match(/^(github|gh)\:(.*)$/)) {
            resolve({
                type: 'git',
                url: 'git@github.com:' + RegExp.$2 + '.git'
            });
        } else {
            reject(new Error("couldn't parse package URL: " + url));
        }
    });
}
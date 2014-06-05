var iniparser = require('iniparser');
var path = require('path');

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = function(cb) {
    
    // TODO: no idea if this is right for windows
    var gitconfigPath = path.join(getUserHome(), '.gitconfig');

    iniparser.parse(gitconfigPath, function(err, data) {
        if (err) {
            cb(err);
        } else if ('github' in data && 'user' in data.github) {
            cb(null, data.github.user);
        } else {
            cb(new Error("no Github user defined in .gitconfig"));
        }
    });

}
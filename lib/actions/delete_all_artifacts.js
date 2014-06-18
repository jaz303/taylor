module.exports = deleteAllArtifacts;

var exec            = require('child_process').exec;
var Promise         = require('../Promise');
var K               = require('../constants');

function deleteAllArtifacts(pkg, target) {
    return new Promise(function(resolve, reject) {

        exec(
            "find . '(' -name " + K.MAKEFILE_NAME + " -or -name '*.o' -or -name build ')' -exec rm -r {} +",
            function(err, stdout, stderr) {
                if (err) {
                    reject(new Error("find exited with code " + err.code));
                } else {
                    resolve();
                }
            }
        );

    });
}

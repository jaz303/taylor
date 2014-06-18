module.exports = gitClonePackage;

var clone       = require('git-clone');
var tmp         = require('tmp');
var fs          = require('fs');
var join        = require('path').join;
var exec        = require('child_process').exec;

var Promise     = require('../Promise');
var K           = require('../constants');

function gitClonePackage(repo, packageRoot, options) {

    if (typeof options === 'function') {
        cb = options;
        options = null;
    }

    options = options || {};

    return new Promise(function(resolve, reject) {

        tmp.dir({unsafeCleanup: true}, function(err, tmpDir) {
            if (err) {
                reject(err);
            } else {
                doClone(tmpDir + '/clone');
            }
        });

        function doClone(packageClonePath) {
            clone(repo, packageClonePath, {
                shallow: true
            }, function(err) {
                if (err) {
                    reject(err);
                } else {
                    removeDotGit(packageClonePath);
                }
            });
        }

        function removeDotGit(packageClonePath) {

            packageClonePath = packageClonePath.trim();
            if (packageClonePath.length === 0) {
                return reject(new Error("sanity check failed - package clone path is empty"));
            }

            exec('rm -rf ' + packageClonePath + '/.git', function(err) {
                if (err) {
                    reject(err);
                } else {
                    readPackageJson(packageClonePath);
                }
            });
            
        }

        function readPackageJson(packageClonePath) {
            var jsonPath = join(packageClonePath, K.PACKAGE_JSON_NAME);
            fs.readFile(jsonPath, {encoding: 'utf8'}, function(err, json) {
                if (err) {
                    reject(err);
                } else {
                    try {
                        var parsedJson = JSON.parse(json);
                        if (!parsedJson.name) {
                            throw new Error("invalid package - no name specified in JSON");
                        }
                        installPackage(packageClonePath, parsedJson.name);
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        }

        function installPackage(packageClonePath, packageName) {
            
            var packageTargetPath = join(packageRoot, packageName);

            fs.exists(packageTargetPath, function(exists) {
                if (exists) {
                    reject(new Error("can't install package - a package with the same name is already installed"));
                } else {
                    fs.rename(packageClonePath, packageTargetPath, function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                name    : packageName,
                                path    : packageTargetPath
                            });
                        }
                    });
                }
            });

        }

    });

}

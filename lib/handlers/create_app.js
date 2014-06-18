module.exports = createApp;

var creator = require('../creator');

function createApp(pkg, options) {
    
    var pkgName = options['<package>'];
    if (!pkgName) {
        throw new Error("package name is required");
    }

    return creator.createApp('.', pkgName);

}
var K = require('./constants');

function Config() {
    this.vars = {};
}

Config.prototype.get = function(key) {
    if (key in process.env) {
        return process.env[key];
    }
    var val = this.vars[key];
    if (typeof val === 'function') {
        return val.call(this);
    } else {
        return val;
    }
}

Config.prototype.set = function(key, value) {
    this.vars[key] = value;
}

Config.prototype.all = function() {
    var all = {};
    for (var k in this.vars) {
        all[k] = this.get(k);
    }
    return all;
}

var config = module.exports = new Config();

config.set(
    K.ENV_KEY_SDK,
    '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.9.sdk'
);

config.set(
    K.ENV_KEY_TOOLCHAIN,
    '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain'
);

config.set(
    K.ENV_KEY_ARCH,
    'x86_64'
);

config.set(
    K.ENV_KEY_TARGET,
    function() { return this.get(K.ENV_KEY_ARCH) + '-apple-macosx10.9'; }
);

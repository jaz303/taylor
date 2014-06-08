function Config() {
	this.vars = {};
}

Config.prototype.get = function(key) {
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
	'SWIFT_SDK',
	"/Applications/Xcode6-Beta.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.10.sdk"
);

config.set(
	'SWIFT_TOOLCHAIN',
	"/Applications/Xcode6-Beta.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain"
);

config.set(
	'SWIFT_ARCH',
	'x86_64'
);

config.set(
	'SWIFT_TARGET',
	function() { return this.get('SWIFT_ARCH') + '-apple-macosx10.9'; }
);

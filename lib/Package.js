module.exports = Package;

var fs = require('fs');

var Makefile = require('./Makefile');

var TARGET_TYPES = {
    'module'    : require('./targets/ModuleTarget')
};

function projectJsonPath(dir) {
    return dir + '/swiftmodule.json';
}

Package.tryLoadFromDirectory = function(ctx, path) {
    if (fs.existsSync(projectJsonPath(path))) {
        return Package.loadFromDirectory(ctx, path);
    }
}

Package.loadFromDirectory = function(ctx, path) {
    var json = fs.readFileSync(projectJsonPath(path), 'utf8');
    return new Package(ctx, path, JSON.parse(json));
}

function Package(ctx, absPath, json) {
    
    this.ctx = ctx;
    this.path = absPath;

    this.name = this._parseName(json.name);
    this.targets = this._parseTargets(json.targets || []);

}

Package.prototype.getName = function() {
    return this.name;
}

Package.prototype.generateMakefile = function() {

    var mf = new Makefile();

    mf.comment('Declarations');

    mf.declarations()
        .line('SRC := $(shell find src -name "*.swift")');

    mf.comment('(begin package targets)');

    var all = mf.target('all', {phony: true});

    this.targets.forEach(function(t) {
        t.generateMakefile(mf);
        all.dep(t.getUmbrellaTarget());
    });

    mf.comment('(end package targets)');

    mf.target('build')
        .line('mkdir -p build');

    mf.target('clean', {phony: true})
        .line('rm -rf build');

    return mf;

}

Package.prototype._parseTargets = function(targets) {
    return targets.map(function(t) { return this._parseTarget(t); }.bind(this));
}

Package.prototype._parseName = function(name) {
    if (!name) {
        throw new Error("a package must have a name!");
    } else {
        return name;
    }
}

Package.prototype._parseTarget = function(target) {
    var ctor = TARGET_TYPES[target.type];
    if (!ctor) {
        throw new Error("unknown target type: " + target.type);
    } else {
        return new ctor(this, target);
    }
}
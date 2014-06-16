module.exports = Package;

var fs = require('fs');
var join = require('path').join;

var K           = require('./constants'),
    Makefile    = require('./Makefile'),
    Promise     = require('./Promise');

var TARGET_TYPES = {
    'app'       : require('./targets/AppTarget'),
    'module'    : require('./targets/ModuleTarget')
};

function packageJsonPath(dir) {
    return dir + '/' + K.PACKAGE_JSON_NAME;
}

Package.tryLoadFromDirectory = function(ctx, path) {
    if (fs.existsSync(packageJsonPath(path))) {
        return Package.loadFromDirectory(ctx, path);
    } else {
        return null;
    }
}

Package.loadFromDirectory = function(ctx, path) {
    var json = fs.readFileSync(packageJsonPath(path), 'utf8');
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

Package.prototype.getInstalledModules = function() {

    var modRoot = this.getAbsoluteModulesPath();

    return fs.readdirSync(modRoot)
            .map(function(file) { return join(modRoot, file); })
            .filter(function(file) { return fs.statSync(file).isDirectory(); })
            .map(function(dir) {
                console.log(dir);
                try {
                    return Package.loadFromDirectory(null, dir);
                } catch (e) {
                    return null;
                }
            })
            .filter(function(pkg) { return !!pkg; });

}

Package.prototype.getAbsolutePath = function() {
    return this.path;
}

Package.prototype.getAbsoluteMakefilePath = function() {
    return this.path + '/' + K.MAKEFILE_NAME;
}

Package.prototype.getAbsoluteModulesPath = function() {
    return this.path + '/modules';
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
    var out = [];
    for (var id in targets) {
        out.push(out[id] = this._parseTarget(id, targets[id]));
    }
    return out;
}

Package.prototype._parseTarget = function(id, target) {
    var ctor = TARGET_TYPES[target.type];
    if (!ctor) {
        throw new Error("unknown target type: " + target.type);
    } else {
        return new ctor(id, this, target);
    }
}

Package.prototype._parseName = function(name) {
    if (!name) {
        throw new Error("a package must have a name!");
    } else {
        return name;
    }
}
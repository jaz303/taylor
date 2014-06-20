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

Package.tryLoadFromDirectory = function(parent, path) {
    try {
        return Package.loadFromDirectory(parent, path);
    } catch (e) {
        if (e.code === 'ENOENT') return null;
        throw e;
    }
}

Package.loadFromDirectory = function(parent, path) {
    var json = fs.readFileSync(packageJsonPath(path), 'utf8');
    return new Package(parent, path, JSON.parse(json));
}

function Package(parent, absPath, json) {
    
    this.parent = parent;
    this.path = absPath;

    this.name = this._parseName(json.name);
    this.targets = this._parseTargets(json.targets || []);

}

Package.prototype.getName = function() {
    return this.name;
}

Package.prototype.getInstalledModules = function() {

    var parent = this;
    var modRoot = this.getAbsoluteModulesPath();
    
    try {
        var moduleDirs = fs.readdirSync(modRoot);
    } catch (e) {
        if (e.code === 'ENOENT') return [];
        throw e;
    }
    
    return moduleDirs
            .map(function(file) { return join(modRoot, file); })
            .filter(function(file) { return fs.statSync(file).isDirectory(); })
            .map(function(dir) {
                try {
                    return Package.loadFromDirectory(parent, dir);
                } catch (e) {
                    // TODO: emit warning
                    return null;
                }
            })
            .filter(function(pkg) { return !!pkg; });

}

Package.prototype.getAppTarget = function() {
    return this._findFirstTarget(
        function(t) { return t.isApp(); },
        "app"
    );
}

Package.prototype.getModuleTarget = function() {
    return this._findFirstTarget(
        function(t) { return t.isModule(); },
        "module"
    );
}

Package.prototype.getTargetById = function(id) {
    for (var i = 0; i < this.targets.length; ++i) {
        if (this.targets[i].id === id) {
            return this.targets[i];
        }
    }
    throw new Error("no such target: " + id);
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
        .line('SRC := $(shell find src -name "*.swift")')
        .line('OBJ := $(patsubst %.swift,%.o,$(SRC))');

    mf.comment('(begin package targets)');

    var all = mf.target('all', {phony: true});

    this.targets.forEach(function(t) {
        t.generateMakefile(mf);
        all.dep(t.getUmbrellaTarget());
    });

    mf.comment('(end package targets)');

    mf.dir('build');

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

Package.prototype._findFirstTarget = function(predicate, errorName) {
    var ts = this.targets.filter(predicate);
    if (ts.length === 0) {
        throw new Error("package has no suitable " + errorName + " target");
    }
    return ts[0];
}
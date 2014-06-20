module.exports = Makefile;

function Makefile() {
    this.phonyTargets = [];
    this.items = [];
}

Makefile.prototype.declarations = function() {
    var decs = new Declarations(this);
    this.items.push(decs);
    return decs;
}

Makefile.prototype.comment = function(comment) {
    this.items.push("#\n# " + comment + "\n");
}

Makefile.prototype.target = function(name, opts) {

    opts = opts || {};
    if (opts.phony) {
        this.phonyTargets.push(name);
    }

    var target = new Target(this, name);
    this.items.push(target);
    return target;

}

Makefile.prototype.dir = function(name) {
    var target = this.target(name);
    target.line('mkdir -p ' + name);
    return target;
}

Makefile.prototype.pattern = function(dest, src) {
    var tgt = this.target('%.' + dest);
    tgt.dep('%.' + src);
    return tgt;
}

Makefile.prototype.generate = function() {

    var mf = '';

    this.items.forEach(function(target) {
        mf += ((typeof target === 'string') ? target : target.generate()) + '\n';
    });

    if (this.phonyTargets.length) {
        mf += '.PHONY: ' + this.phonyTargets.join(' ') + '\n\n';
    }

    return mf;

}

//
// Declarations

function Declarations(makefile) {
    this._makefile = makefile;
    this._lines = [];
}

Declarations.prototype.line = function(line) {
    this._lines.push(line);
    return this;
}

Declarations.prototype.lines = function(lines) {
    this._lines = this._lines.concat(lines.filter(function(l) {
        return !!l || (typeof l === 'string');
    }));
    return this;
}

Declarations.prototype.generate = function() {

    var mf = '';

    mf += this._lines.join("\n");
    mf += "\n";

    return mf;

}

//
// Target

function Target(makefile, name, opts) {
    this._makefile = makefile;
    this._name = name;
    this._deps = [];
    this._lines = [];
}

Target.prototype.getName = function() {
    return this._name;
}

Target.prototype.dep = function(dep) {
    if (dep instanceof Target) dep = dep.getName();
    this._deps.push(dep);
    return this;
}

Target.prototype.line = function(line) {
    this._lines.push(line);
    return this;
}

Target.prototype.lines = function(lines) {
    this._lines = this._lines.concat(lines.filter(function(l) {
        return !!l || (typeof l === 'string');
    }));
    return this;
}

Target.prototype.generate = function() {

    var mf = '';

    mf += this._name + ':';

    if (this._deps.length) {
        mf += ' ' + this._deps.join(' ');
    }

    if (this._lines.length) {
        mf += "\n";
        mf += this._lines.map(function(l) { return "\t" + l; }).join("\n"); 
    }

    mf += "\n";

    return mf;

}
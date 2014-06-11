module.exports = Plan;

var fs 			= require('fs');
var gitClone	= require('git-clone');

function Plan(rootDir) {
	this.rootDir = rootDir;
	this.plan = [];
}

Plan.prototype.exec = function() {
	var prev = Promise.resolve();
	this.plan.forEach(function(step) {
		prev = prev.then(step);
	});
	return prev;
}

Plan.prototype.createDir = function(dirName) {

	var absDir = this.rootDir + '/' + dirName;

	this.plan.push(function() {
		return new Promise(function(resolve, reject) {

			fs.mkdir(absDir, function(err) {
				if (err) {
					reject();
				} else {
					resolve();
				}
			});

		});
	});

	return this;

}

Plan.prototype.clone = function(repo, targetPath, cloneOpts) {
	if (repo.type === 'git') {
		return this.gitClone(repo.url, targetPath, cloneOpts);
	} else {
		throw new Error("unhandled package type: " + packageUrl.type);
	}
}

Plan.prototype.gitClone = function(repo, targetPath, cloneOpts) {

	var absTarget = this.rootDir + '/' + targetPath;

	this.plan.push(function() {
		return new Promise(function(resolve, reject) {

			gitClone(repo, absTarget, cloneOpts, function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});

		});
	});

}
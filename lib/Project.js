module.exports = Project;

var fs = require('fs');

function projectJsonPath(dir) {
    return dir + '/swiftmodule.json';
}

Project.tryLoadFromDirectory = function(ctx, path) {
    if (fs.existsSync(projectJsonPath(path))) {
        return Project.loadFromDirectory(ctx, path);
    }
}

Project.loadFromDirectory = function(ctx, path) {
    var json = fs.readFileSync(projectJsonPath(path), 'utf8');
    return new Project(ctx, path, JSON.parse(json));
}

function Project(ctx, absPath, json) {

}
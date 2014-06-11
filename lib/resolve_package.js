module.exports = resolvePackage;

// TODO: this needs to support many many more sources
function resolvePackage(url) {
	return new Promise(function(resolve, reject) {
		if (url.match(/^(?=gh|github):\/\/(.*?)$/)) {
			resolve({
				type: 'git',
				url: 'git@github.com:' + RegExp.$1 + '.git'
			});
		} else {
			reject(new Error("couldn't parse package URL: " + pkg));
		}
	});
}
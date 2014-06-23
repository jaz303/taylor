module.exports = createApp;

var A = require('../actions');

function createApp(pkg, options) {
    return A.createPackage(options['<package>'], '', {
		app: true,
		targets: { app: { type: 'app' } }
	});
}
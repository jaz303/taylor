module.exports = getConfig;

var Promise = require('../Promise');
var config 	= require('../config');

function getConfig() {
	return new Promise(function(resolve, reject) {
		resolve(config.all());
	});
}
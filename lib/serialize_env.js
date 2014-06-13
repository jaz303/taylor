var quote = require('shell-quote').quote;

// TODO: extract to module object-map-array?
function map(obj, fn) {
	var out = [];
	for (var k in obj)
		out.push(fn(k, obj[k]));
	return out;
}

module.exports = function(env) {
	return map(env, function(k, v) {
		return k + '=' + quote([v]);
	}).join("\n") + "\n";
}

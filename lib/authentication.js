var dropbox = require('/Users/Tom/Dropbox/Projects/nodejs/node-dropbox-api');
	dropbox.config = require('../dbox-config');

var isLoggedIn = function(req) {
	// console.log(req.session);
	if (typeof req.session.options === "object") {
		return true;
	} else {
		return false;
	}
};

exports.authenticationCheck = function(req, res, next) {
	if (isLoggedIn(req)) {
		res.authed = true;
		next();
	} else {
		res.statusCode = 403;
		res.end("403: no Auth");
	}
};

exports.dropbox = function(req, res, next) {
	req.dropbox = {};
	req.dropbox.session = dropbox.session(dropbox.config);

	if (res.authed) {
		req.dropbox.client = dropbox.client(dropbox.session);
	}

	next();
};
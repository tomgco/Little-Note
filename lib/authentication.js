var dropbox = require('../../dropbox-sdk');
	dropbox.config = require('../dbox-config');

exports.authenticationCheck = function(req, res, next) {
	if (req.session.dropbox.authenticated) {
		next();
	} else {
		res.statusCode = 403;
		res.end("403: no Auth");
	}
};

exports.dropbox = function(req, res, next) {
	req.dropbox = {};

	if (typeof req.session.dropbox === 'undefined') req.session.dropbox = {};

	req.dropbox.sess = new dropbox.session(dropbox.config, req.session.dropbox);

	if (req.session.dropbox.authenticated) {
		req.dropbox.client = dropbox.client(req.dropbox.sess);
	}

	next();
};
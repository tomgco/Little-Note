var dbox = require('../dbox-config'),
	markdown = require( "markdown" ).markdown,
	strftime = require("../lib/date_format").strftime;

/*
 * GET
 */

exports.index = function(req, res) {
	if (typeof req.session.options === 'undefined' || typeof req.session.options.uid === 'undefined') {
		renderIndex(req, res);
	} else {
		renderIndexLoggedIn(req, res);
	}
};

var renderIndex = function(req, res) {
	res.render('index', {
		title: 'Little Note',
		date: formatDate(new Date()),
		loginEnabled: app.settings.login,
		locals: {
			styles: ['/stylesheets/front-page.css'],
			javascript: ['/js/base.js','/js/preloader.js']
		}
	});
};

var renderIndexLoggedIn = function(req, res) {
	res.render('application', {
		title: 'Little Note',
		date: formatDate(new Date()),
		locals: {
			styles: [
			'/stylesheets/base.css'
			],
			javascript: [
				'/js/bootstrap-tabs.js',
				'/js/jquery.hotkeys.js',
				'/js/bootstrap-modal.js',
				'/js/bootstrap-dropdown.js',
				'/js/script.js',
				'/js/base.js'
			]
		}
	});
};

exports.tryagain = function(req, res) {
	res.render('tryagain', { title: 'Little Note' });
};

exports.login = function(req, res) {
	if (typeof req.session.options === 'undefined') {
		getRequestToken(req, req, function() {
			redirectForOauth(req, res);
		});
	} else {
		redirectForOauth(req, res);
	}
};

var redirectForOauth = function(req, res) {
	res.redirect("https://www.dropbox.com/1/oauth/authorize?oauth_token=" +
		req.session.options.oauth_token + "&oauth_callback=http://" +
		req.headers.host + "/auth");
};

var getRequestToken = function(req, res, cb) {
	dbox.client.request_token(function(status, reply){
		req.session.options = reply;
		if (typeof cb === 'function') cb(status);
	});
};

exports.preEmptiveLogin = function(req, res) {
	getRequestToken(req, req, function(status) {
		res.statusCode = status;
		res.end();
	});
};

exports.logout = function(req, res) {
	req.session.destroy();
	res.redirect('/');
};

exports.auth = function(req, res) {
	dbox.client.access_token(req.session.options, function(status, reply){
		req.session.options = reply;
		res.redirect('/');
	});
};

exports.api = {};

exports.api.get = {};

exports.api.get.user = function(req, res) {
	dbox.client.account(req.session.options, function(status, reply) {
		req.session.user = reply;
		handleResponse(res, status, reply);
	});
};

exports.api.get.file = function(req, res) {
	var sess = req.session;
	dbox.client.metadata(req.params.location, sess.options, function(status, reply){
		var JSONreply = JSON.parse(reply);
		dbox.client.get(req.params.location, sess.options, function(status, reply) {
			JSONreply.fileContent = reply;
			JSONreply.formattedDate = formatDate(new Date(JSONreply.modified));
			handleResponse(res, status, JSONreply);
		});
	});
};

exports.api.list = function(req, res) {
	var sess = req.session;
	dbox.client.metadata(req.params.location, sess.options, function(status, reply){
		var JSONreply = JSON.parse(reply);
		if (reply.is_dir && typeof reply.contents === "object") {
			handleResponse(res, status, JSONreply.contents);
		} else {
			handleResponse(res, status, JSONreply);
		}
	});
};

exports.api.list.all = function(req, res) {
	var sess = req.session;
	dbox.client.metadata("", sess.options, function(status, reply){
		var JSONreply = JSON.parse(reply);
		handleResponse(res, status, JSONreply.contents);
	});
};

exports.api.put = function(req, res) {
	var sess = req.session;
	dbox.client.put(req.params.location, req.body.data, sess.options, function(status, reply) {
		handleResponse(res, status, {});
	});
};

exports.api.del = function(req, res) {
	var sess = req.session;
	dbox.client.rm(req.params.location, sess.options, function(status, reply) {
		handleResponse(res, status, {});
	});
};

exports.api.preview = function(req, res) {
	res.end(markdown.toHTML(req.body.html));
};

/*
 *	PUT
 */

exports.api.move = function(req, res) {
	var sess = req.session;
	dbox.client.mv(req.params.location, req.body.to, sess.options, function(status, reply) {
		handleResponse(res, status, {});
	});
};

var handleResponse = function(res, status, response /* Object */) {
	res.statusCode = status;

	if (status == 200) {
		res.end(JSON.stringify(response));
	} else {
		res.end(JSON.stringify(response));
	}
};

var getOrdinalSuffix = function(number) {
	var suffixLookup = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];

	if (number % 100 >= 11 && number % 100 <= 13) {
		return number + "th";
	}

	return number + suffixLookup[number % 10];
};

var formatDate = function(date) {
	var number = strftime(date, "%d");
	number = getOrdinalSuffix(number);
	return number + strftime(date, " %B %Y");
};
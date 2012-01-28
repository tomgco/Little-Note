var markdown = require( "markdown" ).markdown,
	strftime = require("../lib/date_format").strftime;
/*
 * GET
 */

exports.index = function(req, res) {
	console.log(req.session.dropbox);
	if (typeof req.session.dropbox === 'undefined' || !req.session.dropbox.authenticated) {
		renderIndex(req, res);
	} else {
		renderIndexLoggedIn(req, res);
	}
};

exports.about = function(req, res) {
	res.render('about', {
		title: 'Little Note',
		loginEnabled: app.settings.login,
		locals: {
			styles: ['/stylesheets/front-page.css'],
			javascript: ['/js/base.js','/js/preloader.js']
		}
	});
};

var renderIndex = function(req, res) {
	res.render('index', {
		title: 'Little Note',
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
	if (typeof req.session.dropbox === 'undefined' || req.session.req_time >= +Date.now()) {
		getRequestToken(req, function() {
			redirectForOauth(req, res);
		});
	} else {
		redirectForOauth(req, res);
	}
};

var redirectForOauth = function(req, res) {
	res.redirect(req.dropbox.sess.getAuthorizeUrl('http://' + req.headers.host + '/auth'));
};

var getRequestToken = function(req, cb) {
	req.dropbox.sess.getRequestToken(function(status, reply) {
		req.session.dropbox = reply;
		req.session.req_time =  +Date.now() + 120;
		if (typeof cb === 'function') cb(status);
	});
};

exports.preEmptiveLogin = function(req, res) {
	getRequestToken(req, function(status) {
		res.statusCode = status;
		res.end();
	});
};

exports.logout = function(req, res) {
	req.session.destroy();
	res.redirect('/');
};

exports.auth = function(req, res) {
	req.dropbox.sess.getAccessToken(function(status, reply){
		req.session.dropbox = reply;
		res.redirect('/');
	});
};

exports.api = {};

exports.api.get = {};

exports.api.get.user = function(req, res) {
	req.dropbox.client.accountInfo(function(status, reply) {
		req.session.user = reply;
		handleResponse(res, status, reply);
		//if (res.statusCode == 200) console.log('[' + new Date().toUTCString().blue + '] ' + 'User Logged: '.yellow + ' ' + reply.email.red);
	});
};

exports.api.get.file = function(req, res) {
	req.dropbox.client.metadata(req.params.location, function(status, reply){
		var JSONreply = JSON.parse(reply);
		req.dropbox.client.getFile(req.params.location, function(status, reply) {
			JSONreply.fileContent = reply;
			JSONreply.formattedDate = formatDate(new Date(JSONreply.modified));
			handleResponse(res, status, JSONreply);
		});
	});
};

exports.api.list = function(req, res) {
	var sess = req.session;
	req.dropbox.client.metadata(req.params.location, function(status, reply) {
		reply = JSON.parse(reply);
		if (reply.is_dir && typeof reply.contents === "object") {
			handleResponse(res, status, reply.contents);
		} else {
			handleResponse(res, status, reply);
		}
	});
};

exports.api.list.all = function(req, res) {
	var sess = req.session;
	req.dropbox.client.metadata("", function(status, reply){
		reply = JSON.parse(reply);
		handleResponse(res, status, reply.contents);
	});
};

exports.api.put = function(req, res) {
	var sess = req.session;
	req.dropbox.client.putFile(req.params.location, req.body.data, function(status, reply) {
		handleResponse(res, status, {});
	});
};

exports.api.del = function(req, res) {
	var sess = req.session;
	req.dropbox.client.removeFile(req.params.location, sess.options, function(status, reply) {
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
	req.dropbox.client.moveFile(req.params.location, req.body.to, function(status, reply) {
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
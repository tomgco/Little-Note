var dbox = require('../dbox-config');

/*
 * GET
 */

exports.index = function(req, res) {
	if (typeof req.session.options === "undefined") {
		res.redirect("/try-again");
	} else {
		dbox.client.account(req.session.options, function(status, reply) {
			console.log(reply);
			res.render('application', { title: 'Little Note', account: reply });
		});
	}
};

exports.tryagain = function(req, res) {
	res.render('tryagain', { title: 'Little Note' });
};

exports.login = function(req, res) {
	dbox.client.request_token(function(status, reply){
		req.session.options = reply;
		res.redirect("https://www.dropbox.com/1/oauth/authorize?oauth_token=" + reply.oauth_token + "&oauth_callback=http://rockhopper.local:3000/auth");
	});
};

exports.auth = function(req, res) {
	dbox.client.access_token(req.session.options, function(status, reply){
		req.session.options = reply;
		dbox.client.account(reply, function(status, reply) {
			res.redirect("/");
		});
	});
};

exports.api = {};

exports.api.get = {};

exports.api.get.file = function(req, res) {
	var sess = req.session;
	dbox.client.get(req.params.location, sess.options, function(status, reply) {
		res.end(reply);
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
}
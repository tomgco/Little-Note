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
		next();
	} else {
		res.statusCode = 403;
		res.end("403: no Auth");
	}
};
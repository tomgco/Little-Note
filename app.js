
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	gzippo = require('gzippo'),
	// cluster = require('cluster'),
	auth = require('./lib/authentication'),
	stylus = require('stylus'),
	RedisStore = require('connect-redis')(express),
	colors = require('colors'),
	cluster = require('cluster');

app = module.exports = express.createServer();

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(stylus.middleware({ src: __dirname + '/public/', compress: true }));
	app.use(express.cookieParser());
	// @Todo Change secret key!
	app.use(express.session({ secret: "nomnomnom", store: new RedisStore() }));
	// app.use(gzippo.staticGzip(__dirname + '/public'));
	app.use(gzippo.staticGzip(__dirname + '/public'));
	app.use(gzippo.compress());
	app.use(app.router);
});

app.configure('development', function(){
	// app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	console.log('WARN:'.red + ' This package depends on a local Redis store'.yellow);
	app.enable('login');
	// app.disable('cluster');
});

app.configure('production', function(){
	app.use(express.errorHandler());
	app.enable('login');
	// app.enable('cluster');
});

// Routes

app.get('/', routes.index);

app.get('/about', routes.about);

// app.get('/try-again', routes.tryagain);

app.get('/logout', routes.logout);

/** DROPBOX AUTH **/

app.get('/pre-emptive-login', auth.dropbox, routes.preEmptiveLogin);

app.get('/login', auth.dropbox, routes.login);

app.get('/auth', auth.dropbox, routes.auth);

/** API ROUTES **/

app.get('/api/get/user', auth.authenticationCheck, auth.dropbox, routes.api.get.user);

app.get('/api/get/:location', auth.authenticationCheck, auth.dropbox, routes.api.get.file);

app.get('/api/list/all', auth.authenticationCheck, auth.dropbox, routes.api.list.all);

app.get('/api/list/:location', auth.authenticationCheck, auth.dropbox, routes.api.list);

app.post('/api/put/:location', auth.authenticationCheck, auth.dropbox, routes.api.put);

app.post('/api/move/:location', auth.authenticationCheck, auth.dropbox, routes.api.move);

app.get('/api/del/:location', auth.authenticationCheck, auth.dropbox, routes.api.del);

app.post('/api/preview', auth.authenticationCheck, auth.dropbox, routes.api.preview);

// if (app.get('cluster') && cluster.isMaster) {
// 	// Fork workers.
// 	for (var i = 0; i < require('os').cpus().length; i++) {
// 		var worker = cluster.fork();
// 		console.log('worker ' + worker.pid + ' started at ' + new Date());
// 	}

// 	cluster.on('death', function(worker) {
// 		console.log('worker ' + worker.pid + ' died');
// 	});
// } else {
	app.listen(process.env.PORT || 3000);
// }

// console.log("Starting Little Note server listening on port %d in %s mode", app.address().port, app.settings.env);

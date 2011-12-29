
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
	colors = require('colors');

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
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	console.log('WARN:'.red + ' This package depends on a local Redis store'.yellow);
	app.enable('login');
});

app.configure('production', function(){
	app.use(express.errorHandler());
	app.disable('login');
});

// Routes

app.get('/', routes.index);

app.get('/about', routes.about);

app.get('/try-again', routes.tryagain);

app.get('/login', routes.login);

app.get('/logout', routes.logout);

app.get('/auth', routes.auth);

app.get('/pre-emptive-login', routes.preEmptiveLogin);

app.get('/api/get/user', auth.authenticationCheck, routes.api.get.user);

app.get('/api/get/:location', auth.authenticationCheck, routes.api.get.file);

app.get('/api/list/all', auth.authenticationCheck, routes.api.list.all);

app.get('/api/list/:location', auth.authenticationCheck, routes.api.list);

app.post('/api/put/:location', auth.authenticationCheck, routes.api.put);

app.post('/api/move/:location', auth.authenticationCheck, routes.api.move);

app.get('/api/del/:location', auth.authenticationCheck, routes.api.del);

app.post('/api/preview', auth.authenticationCheck, routes.api.preview);

// if (cluster.isMaster) {
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

console.log("Starting Little Note server listening on port %d in %s mode", app.address().port, app.settings.env);

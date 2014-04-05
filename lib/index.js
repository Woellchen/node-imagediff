var Hapi = require('hapi');
var swig = require('swig');

var isProduction = process.env.NODE_ENV === 'production';
var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 80;

var options = {
	views: {
		path: 'templates',
		engines: {
			html: {
				module: swig
			}
		}
	}
};

if (!isProduction) {
	swig.setDefaults({
		cache: false
	});

	options.views.isCached = false;
	options.debug = {
		request: ['error']
	};
	options.json = {
		space: 4
	};
}

var server = Hapi.createServer(host, port, options);

server.route({
	'path': '/{path*}',
	'method': 'GET',
	'handler': {
		'directory': {
			'path': 'static',
			'index': false
		}
	}
});
server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply) {
		reply.view('index.html', {
			title: 'hello world'
		});
	}
});

server.start();

console.log('server started listening on http://' + server.info.host + ':' + server.info.port);

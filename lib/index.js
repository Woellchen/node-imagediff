var Hapi = require('hapi'),
	swig = require('swig'),
	compare = require('./imagemagick').compare;

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
server.route({
	method: 'POST',
	path: '/compare',
	handler: function(request, reply) {
		if (typeof request.payload.image1 === 'undefined' || typeof request.payload.image2 === 'undefined') {
			reply(Hapi.error.badRequest('Compare failed!'));

			return;
		}

		compare(request.payload.image1.path, request.payload.image2.path, function(err, data) {
			if (err) {
				reply(Hapi.error.badRequest('Compare failed!', err));

				return;
			}

			reply(data).type('image/png');
		});
	},
	config: {
		payload: {
			output: 'file'
		}
	}
});

server.on('error', function () {
	console.log(arguments);
});

server.start();

console.log('server started listening on http://' + server.info.host + ':' + server.info.port);

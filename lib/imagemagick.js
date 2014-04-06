var spawn = require('child_process').spawn;

var defaultOptions = {
	compareBinary: 'compare',
	convertBinary: 'convert'
};

var ImageMagick = function() {};

ImageMagick.prototype.compare = function(image1, image2, options, cb) {
	if (typeof image1 === 'undefined') {
		throw new Error('image1 is undefined');
	}
	if (typeof image2 === 'undefined') {
		throw new Error('image2 is undefined');
	}
	if (typeof options === 'function') {
		cb = options;
		options = {};
	}
	if (typeof options === 'undefined') {
		options = {};
	}
	if (typeof cb !== 'function') {
		throw new Error('expected a callback');
	}

	var convertBinary = options.convertBinary || defaultOptions.convertBinary;
	var chunks = [];
	var errors = [];

	var child = spawn(convertBinary, [image1, image2, '-compose', 'difference', '-composite', '-evaluate', 'Pow', '2', '-evaluate', 'divide', '3', '-separate', '-evaluate-sequence', 'Add', '-evaluate', 'Pow', '0.5', 'png:-']);
	child.on('close', function (code) {
		if (code > 0) {
			cb(Buffer.concat(errors).toString());

			return;
		}

		cb(null, Buffer.concat(chunks));
	});
	child.stdout.on('data', function(data) {
		chunks.push(data);
	});
	child.stderr.on('data', function(data) {
		errors.push(data);
	});
};

var imageMagick = new ImageMagick();

module.exports.compare = exports.compare = imageMagick.compare;

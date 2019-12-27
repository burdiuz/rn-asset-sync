const { join } = require('path');

module.exports = {
    port: 8180,
	targets: [
		{ name: 'assets', path: join(__dirname, '..', 'test', 'assets'), recursive: true },
		{ name: 'images', path: join(__dirname, '..', 'test', 'images'), recursive: false },
	],
};

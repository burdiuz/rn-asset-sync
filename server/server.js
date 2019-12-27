const { createServer } = require('http');
const { createReadableStream } = require('stream');
const { port, targets } = require('./config.js');

const urls = {
	'/': (res, req) => {},
	'/list': (res, req) => {},
	'/read': (res, req) => {},
};

createServer((req, res) => {
	const url = new URL(req.url, 'http://localhost/');
	const handler = urls[url.pathname];

	if (handler) {
		handler(req, res, url);
	} else {
		res.writeHead(404);
	}

	res.end();
}).listen(port, () => console.log('asset server is ready...'));

const path = require('path');
const { createServer } = require('http');
const {
	createReadStream,
	promises: { readdir, stat, access },
} = require('fs');
const { port, targets } = require('./config.js');

const roots = {};

const rootList = targets
	.filter((item) => {
		const { name } = item;

		if (name in roots) {
			return false;
		}

		roots[name] = item;

		return true;
	})
	.sort(({ name: a }, { name: b }) => (a < b ? -1 : 1));

const wrapPath = (filePath, root = null) => {
	if (!root) {
		root = rootList.find(({ path }) => {
			if (filePath.indexOf(`${path}/`) === 0 || filePath.indexOf(`${path}\\`) === 0) {
				return true;
			}

			return false;
		});

		if (!root) {
			return '';
		}
	}

	return `${root.name}${filePath.substr(root.path.length)}`;
};

const unwrapPath = (wrappedPath) => {
	const [, name, filePath] = wrappedPath.match(/(^[^/\\]+)(.+)$/) || [];
	const root = roots[name];

	if (!root) {
		return '';
	}

	const absolutePath = path.join(root.path, filePath);

	// check if file is in bounds of root folder after normalization
	return absolutePath.indexOf(root.path) === 0 ? absolutePath : '';
};

const writeJSON = (data, res, status = 200) => {
	const body = JSON.stringify(data, null, 2);

	res.writeHead(status, {
		'Content-Length': Buffer.byteLength(body),
		'Content-Type': 'application/json',
	});

	res.write(body);
};

const readDirContents = async (dirPath, recursive = false, lastMTime = NaN, list = []) => {
	const contents = await readdir(dirPath, { withFileTypes: true });

	for (let index = 0; index < contents.length; index++) {
		const item = contents[index];
		const itemPath = path.join(dirPath, item.name);

		if (item.name.charAt() === '.') {
			continue;
		} else if (item.isFile()) {
			if (!Number.isNaN(lastMTime)) {
				const { mtimeMs } = await stat(itemPath);

				if (mtimeMs < lastMTime) {
					continue;
				}
			}

			list.push({
				name: item.name,
				path: itemPath,
			});
		} else if (item.isDirectory() && recursive) {
			await readDirContents(itemPath, recursive, lastMTime, list);
		}
	}

	return list;
};

const urls = {
	'/': (req, res) =>
		writeJSON(
			rootList.map(({ name }) => ({ name })),
			res
		),
	'/list': async (req, res, url) => {
		const name = url.searchParams.get('root');
		// if exists -- sync, if not -- full copy
		const lastMTime = parseInt(url.searchParams.get('mtime'), 10);
		const root = roots[name];

		if (!root) {
			res.writeHead(400);
			return;
		}

		const list = await readDirContents(root.path, root.recursive, lastMTime);

		writeJSON(
			list
				.map((item) => ({
					...item,
					path: wrapPath(item.path, root),
				}))
				.filter(({ path }) => !!path),
			res
		);
	},
	'/read': async (req, res, url) => {
		const file = url.searchParams.get('file');

		if (!file) {
			res.writeHead(400);
			return;
		}

		const filePath = unwrapPath(file);

		if (!filePath) {
			res.writeHead(404);
			return;
		}

		try {
			await access(filePath);
		} catch (error) {
			res.writeHead(401);
			return;
		}

		const { size } = await stat(filePath);

		res.writeHead(200, {
			'Content-Length': size,
			'Content-Type': 'application/octet-stream',
			'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
		});

		const stream = createReadStream(filePath);

		await new Promise((resolve, reject) => {
			stream.on('ready', () => stream.pipe(res));
			stream.on('error', reject);
			stream.on('close', resolve);
		});
	},
};

createServer(async (req, res) => {
	const url = new URL(req.url, 'http://localhost/');
	const handler = urls[url.pathname];

	if (handler) {
		await handler(req, res, url);
	} else {
		res.writeHead(404);
	}

	res.end();
}).listen(port, () => console.log('Asset server is ready...'));

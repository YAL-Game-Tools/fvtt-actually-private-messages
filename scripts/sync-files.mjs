/**
 * Sync static files
 */

import { watch } from 'fs/promises';
import { Glob } from 'bun';
import fs from 'node:fs';
import path from 'path';
import process from 'process';

const DEST = './dist/';

const args = process.argv.slice(2);
const doWatch = args.includes('--watch');

const ignore = ['.git/**/*', 'scripts/**/*']
	.map(m => new Glob(m));

const mappings = [
	{ source: 'static/*', target: '.' },
	{ source: '*.md', target: '.' },
	{ source: 'LICENSE', target: '.' },
	{ source: 'lang/**/*.json', target: './lang' },
];

if (mappings.some(m => m.source.startsWith('.'))) throw new Error('Invalid paths');
mappings.forEach(m => m.glob = new Glob(m.source));

const transformPath = (path) => path.replace(/^(\.[/\\])?static[/\\]/, '');

const copyMap = new Map();
let timer;

function queueSyncFile(npath, type, event) {
	const spath = path.join('./', npath);
	const tpath = transformPath(npath);
	const dpath = path.join(DEST, tpath);

	if (type === 'rename') {
		// TODO: delete old
		// TODO: Check if it was actually renamed
		// BUG: No knowledge of new name
		console.log('ren', ':', tpath);
		// fs.unlink(dpath, (err) => {
		//	if (err) console.error('- failed to remove old file:', dpath);
		// });
		return;
	}

	clearTimeout(timer);
	timer = undefined;

	copyMap.set(spath, dpath);

	timer = setTimeout(doSync, 250);
};

let sync = { promise: Promise.resolve() };

function doSync() {
	timer = undefined;
	const files = [...copyMap];
	copyMap.clear();

	syncFiles(files);
}

async function syncFiles(files) {
	for (const [spath, dpath] of files) {
		// Test if target file is newer
		try {
			if (fs.existsSync(dpath)) {
				const sourceTime = fs.statSync(spath).mtimeMs;
				const destTime = fs.statSync(dpath).mtimeMs;
				if (sourceTime <= destTime) continue; // Ignore if same or older
			}
		}
		catch { /** IGNORE */ }

		fs.cpSync(spath, dpath, { recursive: true });
		console.log('synced |', dpath.replace(/^dist[/\\]/, ''));
	}

	sync.resolve?.(true);
}

function syncMapping(m) {
	if (!m) return;

	sync = Promise.withResolvers();

	for (const file of m.glob.scanSync()) {
		queueSyncFile(file, 'add');
	}
}

for (const m of mappings) {
	syncMapping(m);
}

// Stop here if not watching
if (!doWatch) {
	await sync.promise;
	process.exit(0);
}

let restarting = false;
let watcher = watch('.', { recursive: true });

// Checks if system fell asleep and the watcher needs restart (it does not recover on its own)
let check = Date.now();
const sleepInterval = 10_000;
function checkSleep() {
	const t1 = Date.now();
	const diff = t1 - check;
	if (t1 - check >= sleepInterval * 3) {
		console.log(`System fell asleep for about ${Math.floor(diff / 1000 / 60 / 6) / 10} hours, please restart watcher.`);
		restarting = true;
	}
	check = t1;
}
setInterval(checkSleep, sleepInterval);

// close watcher when Ctrl-C is pressed
process.on('SIGINT', () => {
	console.log('Closing watcher...');
	watcher.close();
	process.exit(0);
});

while (true) {
	for await (const event of watcher) {
		if (ignore.some(g => g.match(event.filename))) continue;
		const match = mappings.find(m => m.glob.match(event.filename));
		if (!match) {
			// Scan a directory on rename
			if (event.eventType === 'change' && fs.lstatSync(event.filename)?.isDirectory()) {
				const m = mappings.find(m => event.filename.startsWith(m.prefix));
				syncMapping(m);
			}
			continue;
		}

		queueSyncFile(event.filename, event.eventType, event);
	}

	if (restarting) {
		restarting = false;
		watcher = watch('.', { recursive: true });
	}
	else {
		break;
	}
}

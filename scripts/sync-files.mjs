import { watch } from 'fs/promises';
import { Glob } from 'bun';
import fs from 'node:fs';
import path from 'path';
import process from 'process';

const debug = false;

const DEST = './dist/';

const args = process.argv.slice(2);
const doWatch = args.includes('--watch');

const ignore = ['.git/**/*', 'scripts/**/*']
	.map(m => new Glob(m));

const mappings = [
	{ source: './release/*', target: '.' },
	{ source: './*.md', target: '.' },
	{ source: './LICENSE', target: '.' },
	{ source: './lang/**/*.json', target: './lang' },
];

mappings.forEach(m => m.glob = new Glob(m.source));

const transformPath = (path) => path.replace(/^(\.[/\\])?release[/\\]/, '');

const syncFile = (npath, type) => {
	const spath = path.join('./', npath);
	const tpath = transformPath(npath);
	const dpath = path.join(DEST, tpath);
	// Test if source file is newer
	try {
		if (fs.existsSync(dpath) && fs.statSync(spath).mtime <= fs.statSync(dpath).mtime) {
			if (debug) console.log('Old file:', tpath);
			return;
		}
		console.log(type, ':', tpath);
	}
	catch (err) {
		console.error(err);
		console.log(type, ':', spath, '->', dpath);
	}
	// TODO: Debounce
	fs.cpSync(spath, dpath, { recursive: true });
};

for (const m of mappings) {
	for (const file of m.glob.scanSync()) {
		syncFile(file, 'add');
	}
}

// Stop here if not watching
if (!doWatch) process.exit(0);

const watcher = watch('.', { recursive: true });

// close watcher when Ctrl-C is pressed
process.on('SIGINT', () => {
	console.log('Closing watcher...');
	watcher.close();
	process.exit(0);
});

for await (const event of watcher) {
	if (ignore.some(g => g.match(event.filename))) continue;
	const match = mappings.find(m => m.glob.match(event.filename));
	if (!match) continue;

	syncFile(event.filename, event.eventType);
}

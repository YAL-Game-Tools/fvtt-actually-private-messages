import chokidar from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const debug = false;

const DEST = './dist/';

const args = process.argv.slice(2);
const watch = args.includes('--watch');

const mappings = [
	{ source: './release/*', target: '.' },
	{ source: './*.md', target: '.' },
	{ source: './LICENSE', target: '.' },
	{ source: './lang/**/*.json', target: './lang' },
];

const transformPath = (path) => path.replace(/^release[/\\]/, '');

const watcher = chokidar.watch(mappings.shift().source, {
	ignored: /(^|[/\\])\../,
	persistent: watch,
	alwaysStat: false,
	useFsEvents: true,
	usePolling: false,
	followSymlinks: true
});

const fileEvent = (npath, type) => {
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
	fs.cpSync(spath, dpath, { recursive: true });
}

watcher
	.on('add', npath => fileEvent(npath, 'Added'))
	.on('change', npath => fileEvent(npath, 'Changed'))
	.on('error', err => console.error(err));

for (const m of mappings)
	watcher.add(m.source);

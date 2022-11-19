import path from 'node:path';
import esbuild from 'esbuild';
import process from 'node:process';
import fs from 'node:fs';

const IN_DIR = './src',
	OUT_DIR = './dist';

const packData = fs.readFileSync('./package.json'),
	packJSON = JSON.parse(packData),
	mainFile = packJSON.source;

const args = process.argv.slice(2),
	watch = args.includes('--watch');

async function build() {
	const res = await esbuild.build({
		entryPoints: [path.join(IN_DIR, mainFile)],
		bundle: true,
		outfile: path.join(OUT_DIR, mainFile),
		metafile: true,
		sourcemap: false,
		minifyIdentifiers: false,
		minifyWhitespace: !watch,
		minifySyntax: !watch,
		keepNames: true,
		platform: 'browser',
		format: 'esm',
		logLevel: 'info',
		logLimit: 0,
		treeShaking: !watch,
		color: true,
		watch,
	})
		.catch(e => process.exit(-1));

	// Display size of sources
	try {
		const originalSizeB = Object.values(res.metafile.inputs).reduce((t, i) => t + i.bytes, 0);
		const files = Object.entries(res.metafile.inputs).reduce((t, [file, data]) => {
			t.add(file);
			data.imports.forEach(d => t.add(d.path));
			return t;
		}, new Set());
		console.log('Original total:', Math.round(originalSizeB / 100) / 10, 'kB,', files.size, 'files');
	}
	catch (err) {
		console.error(err);
	}
}

await build();

import path from 'node:path';
import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import process from 'node:process';
import fs from 'node:fs';

const OUT_DIR = './dist';

const packData = fs.readFileSync('./package.json');
const packJSON = JSON.parse(packData);
const mainFile = packJSON.main;

const args = process.argv.slice(2);

const watch = args.includes('--watch');

async function build() {
	const res = await esbuild.build({
		entryPoints: [mainFile],
		bundle: true,
		outfile: path.join(OUT_DIR, mainFile),
		metafile: true,
		sourcemap: true,
		minify: true,
		minifyIdentifiers: true,
		minifyWhitespace: true,
		minifySyntax: true,
		keepNames: true,
		platform: 'browser',
		format: 'esm',
		logLevel: 'info',
		logLimit: 0,
		treeShaking: true,
		color: true,
		watch,
		external: ['/node_modules/*'],
		plugins: [
			copy({
				// verbose: true,
				resolveFrom: 'out',
				assets: [
					{ from: ['./release/*', './*.md', './LICENSE'], to: '.' },
					{ from: ['./lang/**/*'], to: 'lang', keepStructure: true },
					{ from: ['./template/**/*.hbs'], to: 'template', keepStructure: true },
				]
			})
		]
	}).catch(e => process.exit(-1));

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

build();

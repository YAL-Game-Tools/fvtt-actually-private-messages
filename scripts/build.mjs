import path from 'node:path';
import esbuild from 'esbuild';
import process from 'node:process';
import fs from 'node:fs';

const IN_DIR = './src',
	OUT_DIR = './dist',
	packData = fs.readFileSync('./package.json'),
	packJSON = JSON.parse(packData),
	inFile = path.join(IN_DIR, packJSON.source),
	outFile = path.join(OUT_DIR, packJSON.source);

const args = process.argv.slice(2),
	watch = args.includes('--watch');

async function build() {
	const ctx = await esbuild.context({
		entryPoints: [inFile],
		bundle: true,
		outfile: outFile,
		// outdir: path.resolve(OUT_DIR),
		metafile: true,
		sourcemap: true,
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
	});

	let res;
	if (watch) res = await ctx.watch();
	else res = await ctx.rebuild();

	if (!watch) {
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

		ctx.dispose();
	}
}

await build();

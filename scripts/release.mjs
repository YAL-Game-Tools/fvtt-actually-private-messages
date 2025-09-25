/**
 * Finalize release data and trigger release build CI
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import process from 'node:process';
import prettier from 'prettier';

// TODO: generate version and make sure it does not conflict with existing release tags.

const MANIFEST = './static/module.json',
	CHANGELOG = './CHANGELOG.md';

const args = new Set(process.argv.slice(2));

const isHotFix = args.has('hotfix');
const isBugFix = (args.has('fix') || args.has('patch')) && !isHotFix;
const isMajor = args.has('major') && !isBugFix;
const isMinor = !isHotFix && !isBugFix && !isMajor;
const release = isMajor ? 'major' : (isMinor ? 'minor' : 'fix');

console.log('Release type:', release);

const json = JSON.parse(fs.readFileSync(MANIFEST));
const { version, download } = json;

let [majorVer, minorVer, patchVer] = version.split('.').map(n => Number(n) || 0);
console.log('Old version:', [majorVer, minorVer, patchVer]);

// Reset version numbers
switch (release) {
	case 'major':
		minorVer = 0;
	case 'minor':
		patchVer = 0;
	case 'patch':
	case 'fix':
		patchVer ||= 0;
}

// Increment version
switch (release) {
	case 'major': majorVer += 1; break;
	case 'minor': minorVer += 1; break;
	case 'patch':
	case 'fix': patchVer += 1; break;
}

const newVersion = [majorVer, minorVer, patchVer].join('.');

console.log('New version:', [majorVer, minorVer, patchVer], '=', newVersion);

let sameVer = 0;
const newDownload = download.replace(/releases\/(?<version>[\d.]+)\//, function (matched, oldversion) {
	if (oldversion === newVersion) sameVer++;
	return 'releases/' + newVersion + '/';
});

console.log('Old download:', download);
console.log('New download:', newDownload);
json.version = newVersion;
json.download = newDownload;

// changelog update
const chlog = fs.readFileSync(CHANGELOG, { encoding: 'utf8' });
const chlogu = chlog.replace(/^## NEXT$/m, `## ${json.version}`);
if (chlog === chlogu) { console.log('Changelog needs no update'); }
else {
	console.log('Changelog updated');
	fs.writeFileSync(CHANGELOG, chlogu, 'utf8');
}

// Replace version in download string
if (sameVer > 1) {
	console.log('module.json is up to date');
}
else {
	const pConfig = await prettier.resolveConfig('.');
	const formattedJson = await prettier.format(JSON.stringify(json, undefined, '\t'), { ...pConfig, parser: 'json' });
	fs.writeFileSync(MANIFEST, formattedJson);
	console.log('module.json updated');
}

// Old version shim
// fs.copyFileSync(MANIFEST, MANIFEST_SHIM);

// git tagging
console.log('\nGenerating release:', json.version);
execSync('git add .');
execSync(`git commit -m "${json.version}"`);
execSync(`git tag -a ${json.version} -m "${json.version}"`);
// execSync(`git tag -f latest`);
console.log('Pushing release');
execSync('git push');
console.log('Pushing release tag');
execSync(`git push origin ${json.version}`);

// done

console.log('\nRelease', json.version, 'is ready!\n');

const releaseManifest = json.download.replace(/\/[\w-]+\.zip$/, '/module.json');

console.log('Manifest:', releaseManifest);
console.log('Download:', json.download);

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import process from 'node:process';

// TODO: generate version and make sure it does not conflict with existing release tags.

const MANIFEST = './release/module.json',
	CHANGELOG = './CHANGELOG.md';

const json = JSON.parse(fs.readFileSync(MANIFEST));
const { version, download } = json;

// Check if tag for defined version already exists (except no output with no matching versions)
const oldTagExists = execSync(`git tag -l ${version}`);
if (oldTagExists.toString().split('\n').some(v => v === version)) {
	console.error('Tag already exists for defined version:', version);
	process.exit(0);
}

console.log('%cGenerating release%c:', 'color:gold', 'color:unset', json.version);

const mdownload = download.replace(/(?<version>\d+(?:\.\d+){1,3})/gm, version);

console.log('Old download:', download);
console.log('New download:', mdownload);

// Replace version in download string
if (download === mdownload) {
	console.log('module.json is up to date');
}
else {
	json.download = mdownload;
	fs.writeFileSync(MANIFEST, JSON.stringify(json, null, '\t'));
	console.log('module.json updated');
}

// changelog update
const chlog = fs.readFileSync(CHANGELOG, { encoding: 'utf8' });
const chlogu = chlog.replace(/^## NEXT$/m, `## ${json.version}`);
if (chlog !== chlogu) {
	console.log('Changelog updated');
	fs.writeFileSync(CHANGELOG, chlogu, 'utf8');
}
else
	console.log('Changelog needs no update');

execSync(`npx prettier --write ${MANIFEST}`);

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

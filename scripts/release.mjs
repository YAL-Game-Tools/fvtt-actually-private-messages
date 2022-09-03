import fs from 'node:fs';
import { execSync } from 'node:child_process';

// TODO: generate version and make sure it does not conflict with existing release tags.

// module.json update

const MANIFEST = './release/module.json',
	MANIFEST_SHIM = './module.json'; // for help with upgrading from old versions

const data = fs.readFileSync(MANIFEST);
const json = JSON.parse(data);

const version = json.version;
console.log('%cGenerating release%c:', 'color:gold', 'color:unset', json.version);
const download = json.download;

let sameVer = 0;
const mdownload = download.replace(/(?<version>\d+(?:\.\d+){1,3})/gm, function (matched, oldversion, index, full, groups) {
	if (oldversion === version) sameVer++;
	// console.log({ matched, match: oldversion, index, full, groups })
	// console.log(oldversion, version);
	return version;
});

console.log('Old download:', download);
console.log('New download:', mdownload);

// Replace version in download string
if (sameVer > 1) {
	console.log('module.json is up to date');
}
else {
	json.download = mdownload;
	fs.writeFileSync(MANIFEST, JSON.stringify(json, null, '\t'));
	console.log('module.json updated');
}

// changelog update
const chlogFile = `./${json.changelog}`;
const chlog = fs.readFileSync(chlogFile, { encoding: 'utf8' });
const chlogu = chlog.replace(/^## NEXT$/m, `## ${json.version}`);
if (chlog !== chlogu) {
	console.log('Changelog updated');
	fs.writeFileSync(chlogFile, chlogu, 'utf8');
}
else
	console.log('Changelog needs no update');

execSync(`npx prettier --write ${MANIFEST}`);

// Old version shim
fs.copyFileSync(MANIFEST, MANIFEST_SHIM);

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

console.log('\nRelease', json.version, 'is ready!');

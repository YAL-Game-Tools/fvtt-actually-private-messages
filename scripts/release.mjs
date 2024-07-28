import fs from 'fs';

const data = fs.readFileSync('./system.json');
const json = JSON.parse(data);

const version = json.version;
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
	console.log('system.json is up to date');
}
else {
	json.download = mdownload;
	fs.writeFileSync('./system.json', JSON.stringify(json, null, '\t'));
	console.log('system.json updated');
}

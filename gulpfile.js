const project = 'private-rolls';
const gulp = require('gulp');
const gulp_less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');
const through2 = require('through2')

const lessWatch = ['./less/*.less']; // for watching
const lessOrigin = `./less/${project}.less`; // conversion start
const cssDestination = './css/';// Output

const cssCfg = {};

function updateDownloadPath() {
	return gulp.src('./module.json')
		.pipe(
			through2.obj((file, _, cb) => {
				const string = file.contents.toString();
				const re = string.match(/"version": "(?<ver>[^"]+)"?,$/m);
				const version = re?.groups.ver;
				if (!version) throw new Error('Version not found in module.json');
				// Replace version in download string
				let sameVer = 0;
				const modified = string.replace(/(?=[^"])\d+\.\d+(\.\d+)?(\.\d+)?(?!\.?\d+)(?!")/gm, (m) => {
					if (m === version) sameVer++;
					return version;
				});
				if (sameVer > 1) {
					console.log('module.json is up to date');
					cb(null);
				}
				else {
					console.log('module.json download path needs updating');
					file.contents = Buffer.from(modified);
					cb(null, file)
				}
			})
		)
		.pipe(gulp.dest('./'));
}

const less = () => gulp
	.src(lessOrigin)
	.pipe(gulp_less())
	.pipe(cleanCSS(cssCfg))
	.pipe(gulp.dest(cssDestination));

const watch = async (cb) => {
	gulp.watch(lessWatch, less);
	cb();
};

//gulp.task('less', less);
gulp.task('watch', gulp.parallel(watch));
gulp.task('release', gulp.parallel(updateDownloadPath));
//gulp.task('default', gulp.parallel('less'));

// Dependencies
var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var cssbeautify = require('gulp-cssbeautify');
var mmq = require('gulp-merge-media-queries');
// Extension Configurations
var jgzconfig = {
	extension: 'jgz'
};
var csgzconfig = {
	extension: 'csgz'
};
// File Paths
var paths = {
	destination: './assets/',
	js: [
		'./assets/source/js/*.js'
	],
	scss: [
		'./assets/source/scss/gulp.scss',
		'./assets/source/scss/const/*.scss'
	],
	printScss: [
		'./assets/source/scss/print.scss'
	],
	editorScss: [
		'./assets/source/scss/editor.scss'
	],
	watchScss: [
		'./assets/source/scss/*.scss',
		'./assets/source/scss/const/*.scss'
	]
};

function compileJS(cb) {
	gulp.src(paths.js)
		//.pipe(uglify())
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest('./assets/js'))
		.pipe(notify({
			message: "JS processed"
		}));
	cb();
}

function compileSCSS(cb) {
	gulp.src(paths.scss)
		.pipe(sass({
			outputStyle: 'compressed',
			sourceComments: true
		}).on('error', sass.logError))
		.pipe(concat('screen.css'))
		// condense our media queries down
		.pipe(mmq())
		.pipe(cssbeautify())
		.pipe(gulp.dest('./assets/css'))
		.pipe(notify({
			message: "SCSS processed"
		}));
	cb();
}
// Watchers
gulp.watch(paths.js, compileJS);
gulp.watch(paths.watchScss, compileSCSS);
exports.default = gulp.parallel(compileJS, compileSCSS);
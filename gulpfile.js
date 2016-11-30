var gulp  = require('gulp'),
	shell = require('gulp-shell'),
	concat = require('gulp-concat'),
	clean = require('gulp-clean'),
	fcOrder = [
		'./node_modules/fusioncharts/fusioncharts.js',
		'./node_modules/fusioncharts/fusioncharts.charts.js',
		'./node_modules/fusioncharts/*.js',
		'./node_modules/fusioncharts/**/*.js'
	];

gulp.task('clean-dist', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

gulp.task('runtest',['scripts'], shell.task([
  'phantomjs simulator.js'
]))

gulp.task('scripts',['clean-dist'], function() {
  return gulp.src(fcOrder)
    .pipe(concat('fc.js'))
    .pipe(gulp.dest('./dist/')),
    gulp.src(['test/*.js'])
    .pipe(concat('alltest.js'))
    .pipe(gulp.dest('./dist/')),
    gulp.src(['src/*.js'])
    .pipe(concat('src.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['runtest']);
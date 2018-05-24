'use strict';

const browserify = require('browserify');
const source = require('vinyl-source-stream');

const gulp = require('gulp');
const streamify = require('gulp-streamify');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

const merge = require('merge2');

const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function () {
    const result = gulp.src('lib/**/*.ts')
        .pipe(tsProject(ts.reporter.defaultReporter()));

    return merge([
        result.dts.pipe(gulp.dest('built/definitions')),
        result.js.pipe(gulp.dest('built/js'))
    ]);
});

gulp.task('bundle', function () {
    const bundle = browserify(
        'built/js/client.index.js',
        {
            standalone: 'Impetus',
        }).bundle();

    return bundle
        .pipe(source('client.index.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(streamify(uglify()))
        .pipe(rename('client.index.min.js'))
        .pipe(gulp.dest('./dist/'));
});
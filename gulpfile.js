/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

'use strict';

var _SRC = './src';
var SRC = _SRC.concat('/');

var _BUILT = './built';
var BUILT = _BUILT.concat('/');
var BUILT_TEST = _BUILT.concat('.test/');
var BUILT_TYPINGS = _BUILT.concat('/typings/');

var DST = './dist/';
var LIB = './lib/';

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var gulp = require('gulp');
var del = require('del');
var merge = require('merge2');

var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', function (done) {
    del([BUILT, BUILT_TEST, DST, LIB]).then(paths => done());
});

gulp.task('build', function () {
    const result = gulp.src(SRC.concat('**/*.ts'))
        .pipe(tsProject(ts.reporter.defaultReporter()));

    return merge([
        result.js.pipe(gulp.dest(BUILT)),
        result.dts.pipe(gulp.dest(BUILT_TYPINGS))
    ]);
});

var rollup = require('rollup-stream');

gulp.task('bundle', function () {
    var result = rollup('rollup.config.js')
        .pipe(source('index.js'))
        .pipe(buffer())
        .pipe(gulp.dest(LIB));

    return merge([
        result,
        gulp.src(BUILT_TYPINGS.concat('**')).pipe(gulp.dest(LIB))
    ]);
});

gulp.task('default', gulp.series('clean', 'build', 'bundle'));
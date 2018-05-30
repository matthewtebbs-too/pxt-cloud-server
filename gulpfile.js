/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

'use strict';

const gulp = require('gulp');
const del = require('del');
const merge = require('merge2');

const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', function (done) {
    del(['./built', './built.test', './lib']).then(paths => done());
});

gulp.task('build', function () {
    const result = gulp.src('./src/**/*.ts')
        .pipe(tsProject(ts.reporter.defaultReporter()));

    return merge([
        result.js.pipe(gulp.dest('./built')),
        result.dts.pipe(gulp.dest('./built/typings'))
    ]);
});

const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');

gulp.task('bundle', function () {
    const result = rollup('rollup.config.js')
        .pipe(source('index.js'));

    return merge([
        result.pipe(gulp.dest('./lib/')),
        gulp.src('./built/typings/**').pipe(gulp.dest('./lib/typings'))
    ]);
});

gulp.task('default', gulp.series('clean', 'build', 'bundle'));
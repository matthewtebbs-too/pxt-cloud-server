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

/* Reference: https://medium.com/@kelin2025/so-you-wanna-use-es6-modules-714f48b3a953 */
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const rollup = require('gulp-rollup');

const dependencies = Object.keys(require('./package.json').dependencies).concat('fs', 'http', 'path');

gulp.task('bundle', function () {
    const bundle = gulp.src('./built/**/*.js');

    const result = bundle.pipe(rollup({
        input: './built/index.js',
        output: {
            file: 'index.js',
            format: 'cjs',
            name: 'pxtcloud',
            sourcemap: false,
        },
        plugins: [
            commonjs(),
            resolve()
        ],
        external: dependencies,
        interop: false,
    }));

    return merge([
        result.pipe(gulp.dest('./lib/')),
        gulp.src('./built/typings/**').pipe(gulp.dest('./lib/typings'))
    ]);
});

gulp.task('default', gulp.series('clean', 'build', 'bundle'));
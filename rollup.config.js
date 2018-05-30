/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

'use strict';

/* Reference: https://medium.com/@kelin2025/so-you-wanna-use-es6-modules-714f48b3a953 */
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');

const dependencies = Object.keys(require('./package.json').dependencies).concat('fs', 'http', 'path');

export default {
    rollup: require('rollup'),

    input: './built/index.js',
    output: {
        format: 'cjs',
        name: 'pxtcloud',
        sourcemap: false,
    },
    plugins: [
        commonjs(),
        resolve()
    ],
    external: dependencies
};
  
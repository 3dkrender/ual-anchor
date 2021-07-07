import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import fs from 'fs'
import json from '@rollup/plugin-json'
import pkg from './package.json'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import {terser} from 'rollup-plugin-terser'
import typescript from '@rollup/plugin-typescript'

const main_index = 'AnchorBundlerExport.ts';

const license = fs.readFileSync('LICENSE').toString('utf-8').trim()
const banner = `
/**
 * UAL Anchor v${pkg.version}
 * 
 * - Pack by 3DKRender Team
 * 
 * @license
 * ${license.replace(/\n/g, '\n * ')}
 */
`.trim();

const pkg_modules = {
    "main": "lib/ual-anchor.js",
    "module": "lib/ual-anchor.m.js",
    "types": "lib/ual-anchor.d.ts",
    "unpkg": "lib/ual-anchor.bundle.js"
};

const exportFix = `
(function () {
    var pkg = UALAnchor;
    UALAnchor = pkg.default;
    for (var key in pkg) {
        if (key === 'default') continue;
        UALAnchor[key] = pkg[key];
    }
})()
`

const replaceVersion = replace({
    preventAssignment: true,
    __ver: pkg.version,
})

export default [
    {
        input: `src/${main_index}`,
        output: {
            banner,
            file: pkg_modules.module,
            format: 'esm',
            sourcemap: true,
        },
        plugins: [replaceVersion, typescript({target: 'es2020'})],
        external: Object.keys({...pkg.dependencies, ...pkg.peerDependencies}),
        onwarn,
    },
    {
        input: `src/${main_index}`,
        output: {banner, file: pkg_modules.types, format: 'esm'},
        onwarn,
        plugins: [dts()],
    },
    {
        input: pkg_modules.module,
        output: {
            globals: { 'anchor-link': 'AnchorLink', 'anchor-link-browser-transport': 'AnchorLinkBrowserTransport' },
            banner,
            footer: exportFix,
            name: 'UALAnchor',
            file: pkg_modules.unpkg,
            format: 'iife',
            sourcemap: true,
            exports: 'named',
        },
        plugins: [
            replaceVersion,
            resolve({browser: true}),
            commonjs(),
            json(),
            babel({
                babelHelpers: 'bundled',
                exclude: /node_modules\/core-js.*/,
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: '>0.25%, not dead',
                            useBuiltIns: 'usage',
                            corejs: '3',
                        },
                    ],
                ]
            }),
            terser({
                format: {
                    comments(_, comment) {
                        return comment.type === 'comment2' && /@license/.test(comment.value)
                    },
                    max_line_len: 500,
                },
            }),
        ],
        external: Object.keys({...pkg.peerDependencies}),
        onwarn,
    },
]

function onwarn(warning, rollupWarn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
        // unnecessary warning
        return
    }
    if (
        warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
        warning.source === 'tslib' &&
        warning.names[0] === '__read'
    ) {
        // when using ts with importHelpers: true rollup complains about this
        // seems safe to ignore since __read is not actually imported or used anywhere in the resulting bundles
        return
    }
    rollupWarn(warning)
};
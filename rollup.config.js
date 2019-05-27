import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import { terser } from "rollup-plugin-terser";
import commonjs from 'rollup-plugin-commonjs'

import autoprefixer from 'autoprefixer';

export default [
    {
        input: 'src/index.ts',
        output: [
            // 输出es模块
            {
                file: './lib/esm/index.js',
                format: 'esm',
                sourcemap: true,
            },
            // 输出commonjs模块
            {
                file: './lib/cjs/index.js',
                format: 'cjs',
                sourcemap: true, 
            },
            // 输出脚本可以引用的模块
            {
                file: './lib/iife/index.js',
                name: 'libTest',
                format: 'iife',
                sourcemap: true, 
                globals: {
                    'react': 'React'
                }
            }
        ],
        plugins: [
            postcss({
                modules: true,
                minimize: true,
                extensions: [ '.css', '.scss' ],
                plugins: [ autoprefixer ]
            }),
            babel({
                exclude: 'node_modules/**',
                extensions: [ '.mjs', '.ts', '.tsx', '.json', '.js', '.jsx' ]
            }),
            resolve({
                extensions: [ '.mjs', '.ts', '.tsx', '.json', '.js', '.jsx' ]
            }),
            commonjs(),
            terser()
        ],
        external: [ 'react', 'react-dom' ]
    }
];
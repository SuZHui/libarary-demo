// import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import { terser } from "rollup-plugin-terser";
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2';

import autoprefixer from 'autoprefixer';

export default [
    {
        input: 'src/index.ts',
        output: [
            // 输出es模块
            {
                file: './lib/index.esm.js',
                format: 'esm',
                sourcemap: true,
            },
            // 输出commonjs模块
            {
                file: './lib/index.cjs.js',
                format: 'cjs',
                sourcemap: true,
            },
            // 输出脚本可以引用的模块
            {
                file: './lib/index.iife.js',
                name: 'libTest',
                format: 'iife',
                sourcemap: true,
                globals: {
                    'react': 'React',
                }
            }
        ],
        plugins: [
            commonjs({
                include: ['./node_modules/**'],
                // namedExports: {
                //     'node_modules/rxjs/Subject.js': [ 'Subject' ]
                // }
            }),
            postcss({
                modules: true,
                minimize: true,
                extensions: [ '.css', '.scss' ],
                plugins: [ autoprefixer ]
            }),
            resolve({
                mainFields: [ 'module', 'main' ],
                preferBuiltins: true,
                extensions: [ '.mjs', '.ts', '.tsx', '.json', '.js', '.jsx' ],
                customResolveOptions: {
                    moduleDirectory: 'node_modules'
                }
            }),
            typescript({
              useTsconfigDeclarationDir: false
            }),
            // babel({
            //     exclude: 'node_modules/**',
            //     extensions: [ '.mjs', '.ts', '.tsx', '.json', '.js', '.jsx' ]
            // }),
            terser()
        ],
        external: [ 'react', 'react-dom' ]
    }
];

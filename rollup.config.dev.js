import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import { terser } from "rollup-plugin-terser";

import autoprefixer from 'autoprefixer';

export default {
    input: 'src/index.js',
    output: {
        file: './lib/bundle.js',
        format: 'cjs',
        sourcemap: true, 
    },
    plugins: [
        postcss({
            modules: true,
            minimize: true,
            extensions: [ '.css', '.scss' ],
            plugins: [ autoprefixer ]
        }),
        resolve(),
        babel({
            exclude: 'node_modules/**'
        }),
        terser()
    ],
    external: [ 'react', 'react-dom' ]
};
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'src/index.js',
    output: {
        file: './lib/bundle.js',
        format: 'cjs',
        sourcemap: true, 
        banner: `/**\n * @Author suzh<362680581@qq.com>\n * @Date 2019-5-24\n **/`,
        footer: '/* contact me with e-mail szh362680581@qq.com */',
    },
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**'
        }),
    ],
    external: [ 'react', 'react-dom' ]
};
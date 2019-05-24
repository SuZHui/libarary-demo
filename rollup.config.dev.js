export default {
    input: 'src/main.js',
    output: {
        file: './build/bundle.js',
        format: 'cjs',
        sourcemap: true, 
        banner: `/**\n * @Author suzh<362680581@qq.com>\n * @Date 2019-5-24\n **/`,
        footer: '/* contact me with e-mail szh362680581@qq.com */',
    },
    
};
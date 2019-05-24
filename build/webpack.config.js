const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const rootDir = path.resolve(__dirname, '../');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    context: rootDir,
    entry: {
        index: './example/main.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(rootDir, './dist/')
    },
    devServer: {
        contentBase: './example',
        publicPath: '/',
        port: 9000,
        hot: true,
        stats: 'minimal'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Lib Test',
            template: path.resolve(rootDir, './build/index.html')
        })
    ]
}
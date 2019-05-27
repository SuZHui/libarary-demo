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
    resolve: {
        extensions: [ '.js', '.ts', '.jsx', '.tsx', '.json' ],
        alias: {
            'test-lib': path.resolve(rootDir, './lib/bundle')
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
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
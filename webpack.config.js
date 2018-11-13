const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.((png)|(eot)|(woff)|(woff2)|(ttf)|(svg)|(gif))(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader?name=/[hash].[ext]'
            },
            {
                test: /\.json$/, 
                loader: 'json-loader'
            },
            {
                loader: 'babel-loader',
                test: /\.js?$/,
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
        })
    ],
    context: path.join(__dirname, 'src'),
    entry: {
        app: ['./js/critical-sw'],
        worker1: ['./js/worker1']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js'
    },
    externals: [/^vendor\/.+\.js$/]
};

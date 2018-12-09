const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require("webpack-manifest-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

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
        }),
        new ManifestPlugin({
            fileName: "site/data/manifest.json"
        }),
        new WorkboxPlugin.InjectManifest({
            swSrc: './src/js/sw.js',
            // Exclude images from the precache
            exclude: [/\.(?:png|jpg|jpeg|svg)$/]
        })
    ],
    context: path.join(__dirname, 'src'),
    entry: {
        main: ['./js/index'],
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].[contenthash].js'
    },
    externals: [/^vendor\/.+\.js$/],
    optimization: {
        minimizer: [
          new TerserPlugin({
            sourceMap: true,
            terserOptions: {
              compress: {
                inline: 1
              },
              mangle: {
                safari10: true
              },
              output: {
                safari10: true
              }
            }
          })
        ]
      },
     // Turn off various NodeJS environment polyfills Webpack adds to bundles.
    // They're supposed to be added only when used, but the heuristic is loose
    // (eg: existence of a variable called setImmedaite in any scope)
    node: {
        console: false,
        // Keep global, it's just an alias of window and used by many third party modules:
        global: true,
        // Turn off process to avoid bundling a nextTick implementation:
        process: false,
        // Inline __filename and __dirname values:
        __filename: 'mock',
        __dirname: 'mock',
        // Never embed a portable implementation of Node's Buffer module:
        Buffer: false,
        // Never embed a setImmediate implementation:
        setImmediate: false
      },
};

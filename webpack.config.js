const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require("webpack-manifest-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
    {
        name: 'service-worker',
        mode: 'production',
        context: path.join(__dirname, 'src'),
        entry: {
            sw: './js/sw'
        },
        module: {
            rules: [
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
        output: {
            path: path.join(__dirname, 'dist'),
            publicPath: '/',
            filename: '[name].[contenthash].js'
        },
        target: 'webworker',
        plugins: [
            new ManifestPlugin({
                fileName: "../site/data/manifest-sw.json"
            })
        ],
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
        }
    },
    {
        name: 'main',
        mode: 'production',
        entry: {
            main: './js/index'
        },
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
            new webpack.HashedModuleIdsPlugin(),
            new webpack.ProvidePlugin({
                'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
            }),
            new ManifestPlugin({
                fileName: "../site/data/manifest.json"
            }),
            new webpack.EnvironmentPlugin({
                SW_PATH: JSON.parse(fs.readFileSync(path.join(__dirname, 'site/data/manifest-sw.json'), 'utf8'))['sw.js']
            })
        ],
        context: path.join(__dirname, 'src'),
        recordsPath: path.join(__dirname, "records.json"),
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
        }
    }
];

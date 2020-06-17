var path = require('path');
var webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const buildDir = "output";

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, buildDir),
        filename: 'bundle.min.js',
        libraryTarget: 'umd'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|build)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env']
                    }
                }
            },
            {
                test: /\.css$/,
                exclude: /(node_modules|bower_components|build)/,
                use: [ 'style-loader','css-loader'],
            },
            {
                test: /\.(png|gif|jpe?g|svg)$/,
                exclude: /(node_modules|bower_components|build)/,
                use: {
                    loader: 'file-loader',
                }
            }
        ]
    },

     plugins: [
        new webpack.DefinePlugin({
            "process.env": { 
                NODE_ENV: JSON.stringify("production") 
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
        new CopyPlugin([
            { from: "public", to: path.resolve(__dirname, buildDir) },
        ]),
    ]
}

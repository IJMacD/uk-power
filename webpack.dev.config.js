var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname),
        filename: 'bundle.js',
        libraryTarget: 'umd'
    },

    devServer: {
        contentBase: path.resolve(__dirname),
        compress: true,
        port: 9000,
        host: 'localhost',
        open: true
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
               APP_ENV: JSON.stringify("browser") 
           }
       }),
    ]
}

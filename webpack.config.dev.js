const {resolve} = require('path')
const _ = require('lodash')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: resolve(
      __dirname,
      `node_modules/.cache/webpack-${process.env.NODE_ENV}`
    ),
  },
  devServer: {
    historyApiFallback: true,
    host: 'localhost',
    port: 8888,
    static: {directory: resolve(__dirname, 'public')},
  },
  devtool: 'eval-source-map',
  entry: {
    application: resolve(__dirname, 'index.js'),
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: resolve(
            __dirname,
            `node_modules/.cache/babel-loader-${process.env.NODE_ENV}`
          ),
          cacheCompression: false,
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
  plugins: _.compact([
    new MiniCssExtractPlugin({
      filename: 'stylesheets/[name].css',
    }),
    new webpack.ProvidePlugin({
      _: 'lodash',
    }),
    new HtmlWebpackPlugin(),
  ]),
  resolve: {
    modules: [resolve(__dirname, 'app'), 'node_modules'],
  },
  node: {__filename: true}, // is used in unit tests for full file name access
  target: 'web',
}

const path = require('path');
require('dotenv').config();

const buildPath = env => path.resolve(__dirname, `build/${env}`);

module.exports = {
  mode: 'production',
  entry: './src/app.js',
  output: {
    path: buildPath('prod'),
    filename: "atomic_search_widget.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          "presets": ["@babel/env"]
        },
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      }
    ]
  },
  devServer: {
    contentBase: buildPath('dev'),
    port: process.env.ASSET_PORT,
    disableHostCheck: true
  }
};

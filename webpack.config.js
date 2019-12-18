const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, "build"),
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
  }
};

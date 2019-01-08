const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: {
    app: "./src/index.ts"
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: './dist',
    hot: true
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [{
        test: /\.tsx?$/,
        exclude: [
          /(\.test\.*tsx?$)/,
          /node_modules/
        ],
        use: "ts-loader"
      },
      {
        test: /\.scss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader, // extracts into a separate css file and injects into the html
          //"style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      inject: "body"
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};
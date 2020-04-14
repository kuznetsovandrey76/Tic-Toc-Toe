const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, 'src/client'),
    entry: './js/main.js',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    }, 
    mode: 'development',
    resolve: {
      // короткие пути для import'ов
      alias: {
        "@": path.resolve(__dirname, 'src'),
        "@client": path.resolve(__dirname, 'src/client'),
        "@server": path.resolve(__dirname, 'src/server'),
        "@shared": path.resolve(__dirname, 'src/shared')
      }
    },
    plugins: [
        new HtmlWebpackPlugin({
          template: './html/index.pug'
        }),
        new CleanWebpackPlugin()
    ],
    module: {
        rules: [
            {
              test: /\.s[ac]ss$/,
              use: [
                'style-loader',
                'css-loader',
                'sass-loader',
              ]
            },
            {
              test: /\.(png|jpg|svg|gif)$/,
              use: [
                {
                  loader: 'file-loader',
                  options: {
                    name: 'img/[name].[ext]',
                  },
                },
              ],
            },
            {
              test: /\.pug$/,
              loader: 'pug-loader'
            }
        ]
    }
}
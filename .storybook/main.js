/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path');
const sass = require('sass');

const maxAssetSize = 230 * 1024;

const config = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-scss',
    'storybook-addon-turbo-build'
  ],
  framework: {
    name: '@storybook/react-webpack5'
  },
  features: {
    storyStoreV7: true,
  },
  webpackFinal: (config) => {
    config.resolve.fallback.fs = false;
    return {
      ...config,
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20 * 1024,
          maxSize: maxAssetSize,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        }
      },
      performance: {
        maxAssetSize: maxAssetSize,
        maxEntrypointSize: maxAssetSize,
      },
      module: {
        rules: [
          {
            test: /\.(js|ts|jsx|tsx)$/,
            exclude: /node_modules/,
            include: path.resolve(__dirname, '../'),
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ["@babel/preset-env", "@babel/preset-react"]
            }
          },
          {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'sass-loader',
                options: {
                  implementation: sass,
                  sassOptions: {
                    includePaths: [path.resolve(__dirname, '..', 'node_modules')]
                  }
                }
              }
            ],
            include: path.resolve(__dirname, '../')
          },
          {
            test: /\.svg$/,
            use: [
              'babel-loader',
              {
                loader: 'react-svg-loader',
                options: {
                  svgo: {
                    plugins: [
                      { removeTitle: false }
                    ],
                    floatPrecision: 2
                  }
                }
              }
            ]
          },
          {
            test: /\.(eot|ttf|woff|woff2)$/,
            use: {
              loader: 'file-loader',
              options: {
                outputPath: 'fonts',
              },
            },
          }   
        ]      
      }
    };
  }
}
export default config;

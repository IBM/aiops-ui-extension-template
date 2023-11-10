/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const {readFile} = require('fs/promises');
const path = require('path');
const autoprefixer = require('autoprefixer');

const {loginWithApiKey} = require('cp4waiops-ui-bundle-tools');

const targetData = fs.readFileSync('./target.json');
const targetDataJSON = JSON.parse(targetData);

async function loadRoutesFile() {
  const routesFile = String(await readFile(path.join(__dirname, './config/routes.json')));

  return routesFile.replace(/\{\{BUNDLE_PATH\}\}/g, `bundles/${targetDataJSON.bundleName}/files/${targetDataJSON.bundleName}-bundle.js`);
}

module.exports = async (env) => {
  // For insecure mode (no certs)
  if (targetDataJSON.insecure) {
    process.removeAllListeners('warning');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  let mconfig;
  if (env.WEBPACK_SERVE) {
    mconfig = await loginWithApiKey(targetDataJSON.url, targetDataJSON.username, targetDataJSON.apiKey);
    console.log('Logged into cluster 📡');
  }

  return {
    mode: 'development',
    entry: './src/index.js',
    output: {
      // this will need to match the route specified in aiopsuiextension cr
      filename: `${targetDataJSON.bundleName}-bundle.js`,
      path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        middlewares.unshift({
          name: 'ui-routes',
          path: '/aiops/static/uiextensions/configuration',
          middleware: async (req, res) => {
            const routesFile = await loadRoutesFile();
            res.contentType('application/json');
            res.send(routesFile);
          },
        });

        (async () => {
          const routesFile = JSON.parse(await loadRoutesFile());

          console.log('#################################');
          console.log('Access your stuff at these links (note port may differ if existing dev server running. Please see webpack-dev-server logs.):');
          console.log(routesFile.routes.map(route => `  ${route.title}: https://127.0.0.1:8080/aiops/${targetDataJSON.tenantId}/page${route.path}`).join('\n'));
          console.log('#################################');
          console.log('');
        })();
        console.log(middlewares);

        return middlewares;
      },
      devMiddleware: {
        index: true,
        publicPath: `/api/p/hdm_custom_panel/${targetDataJSON.tenantId}/bundles/${targetDataJSON.bundleName}/files`
      },
      server: 'https',
      port: 'auto',
      proxy: env.WEBPACK_SERVE && {
        '/': {
          target: mconfig.zenUrl,
          secure: false,
          changeOrigin: true,
          onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('Cookie', `${req.headers.cookie}; ibm-private-cloud-session=${encodeURIComponent(mconfig.authToken)}`);
          },
          logLevel: 'debug'
        }
      },
      client: {
        overlay: false
      }
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [autoprefixer]
                },
                sourceMap: true
              }
            },
            'sass-loader'
          ]
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                name: '[name]',
                prefixize: true,
                runtimeCompat: true
              }
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js", ".tsx"],
    },
  }
};
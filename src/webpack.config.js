const TerserPlugin = require("terser-webpack-plugin");
const WebpackObfuscator = require("webpack-obfuscator");
const path = require("path");

module.exports = {
  // other configurations...
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "/",
    clean: true,
  },
  mode: "production",

  // devtool: process.env.NODE_ENV === "development" ? "source-map" : false,
  devtool: "source-map",
  plugins: [
    new WebpackObfuscator(
      {
        rotateStringArray: true,
        stringArray: true,
        stringArrayThreshold: 0.8,
        deadCodeInjection: true,
        selfDefending: true,
        debugProtection: true, // Adds protection against debugging
        domainLock: ["https://mauryagallaxyofwishes.vercel.app/"], // Optional: lock code to a specific domain
      },
      ["excluded_file.js"] // Exclude specific files
    ),
  ],

  optimization: {
    minimize: true, // Enable minification
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: ["$", "exports", "require", "React"], // Don't mangle these variables
          },
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        extractComments: false, // Remove comments in the production build
        sourceMap: false, // Disable Terser source map generation
      }),
    ],
    splitChunks: {
      chunks: "all",
      minSize: 10000,
      maxSize: 250000,
    },
  },
  module: {
    rules: [
      // other rules...
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
      // CSS Loader
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      // Asset Loader (images, fonts, etc.)
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },

      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
        exclude: /node_modules/,
      },
    ],
  },

  // Resolve extensions
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
};

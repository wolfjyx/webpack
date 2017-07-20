var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
 var HtmlWebpackPlugin = require('html-webpack-plugin');
var mqpacker = require('css-mqpacker');
var precss  = require('precss');
var autoprefixer = require('autoprefixer');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var entries = getEntry('src/js/page/*.js', 'src/js/page/');
var chunks = Object.keys(entries);

var config = {
  entry: entries,
  resolve: {  // 请求重定向，显示指出依赖查找路径
    alias: {
      img: path.resolve('./src/sass'),
    }
  },
  output: {
    path: path.join(__dirname, 'bundle'),
    publicPath: '/static/',
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[name].js'
  },
  module: {
    loaders: [ //加载器
      {
        test: /\.jade$/,
        loader: 'jade'
      },{
        test: /\.hbs/,
        loader:__dirname + "/src/js/hbs/?helperDirs[]="+ __dirname+"/src/js/hbs/helpers&partialDirs[]="+ __dirname+"/src/js/hbs/partials",

      },{
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss')
      },{
        test:/\.sass$/,
        loader: ExtractTextPlugin.extract('style','css!postcss!sass')
      },{
        test: /\.html$/,
        loader: "html?-minimize"    //避免压缩html
      }, {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=styles/fonts/[name].[ext]'
      }, {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'url-loader?limit=8192&name=styles/imgs/[name]-[hash].[ext]'
      }
    ]
  },
  postcss: function () {
    return [precss, autoprefixer,mqpacker];
  },
  resolve:{
    extensions:['','.js','.json','.sass','.hbs']
  },
  externals: {    // 指定采用外部 CDN 依赖的资源，不被webpack打包
    jquery: "jQuery",
  },
  plugins: [
    new CommonsChunkPlugin({
      name: 'vendors', // 将公共模块提取，生成名为`vendors`的chunk
      chunks: chunks,
      minChunks: chunks.length // 提取entry共同依赖的模块
    }),
    new ExtractTextPlugin('styles/vendors.css'), //单独使用link标签加载css并设置路径，相对于output配置中的publickPath
     new UglifyJsPlugin({ //压缩代码
         comments: false,
         compress: {
            warnings:true,
            unused: false
        },
        except: ['$super', 'exports', 'require'] //排除关键字
    })
  ]
};

var pages = Object.keys(getEntry('src/jade/*.jade', 'src/jade/'));
pages.forEach(function(basename) {
  var conf = {
    filename: '../bundle/html/' + basename + '.html', //生成的html存放路径，相对于path
    template: 'src/jade/' + basename + '.jade', //html模板路径
    inject: false,  //js插入的位置，true/'head'/'body'/false
    minify: { //压缩HTML文件
      removeComments: false, //移除HTML中的注释
      collapseWhitespace: true //空白符与换行符
    }
  };
  if (basename in config.entry) {
    conf.inject = 'body';
    conf.chunks = ['vendors', basename];
    conf.hash = true;
  }
  config.plugins.push(new HtmlWebpackPlugin(conf));
});


module.exports = config;

function getEntry(globPath, pathDir) {
  var files = glob.sync(globPath);
  var entries = {},
    entry, dirname, basename, pathname, extname;

  for (var i = 0; i < files.length; i++) {
    entry = files[i];
    dirname = path.dirname(entry);
    extname = path.extname(entry);
    basename = path.basename(entry, extname);

    pathname = path.join(dirname, basename);
    pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
    entries[basename] = ['./' + entry];
  }
  return entries;
}



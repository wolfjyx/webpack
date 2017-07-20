var fs = require('fs');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

var serverPort = 55555,
    devPort = 8080;
var exec = require('child_process').exec;
var cmdStr = 'PORT=' + serverPort + ' supervisor ./bin/www';
exec(cmdStr);


for (var i in config.entry) {
  config.entry[i].unshift('webpack-dev-server/client?http://localhost:' + devPort, "webpack/hot/dev-server")
}
config.plugins.push(new webpack.HotModuleReplacementPlugin());


//启动服务
var app = new WebpackDevServer(webpack(config), {
  publicPath: '/static/',
  hot: true,
  inline: true
});
app.listen(devPort, function() {
  console.log('dev server on http://0.0.0.0:' + devPort+'\n');
});
exec('webpack --progress  -w --hide-modules', function (err, stdout, stderr) {
  if (err) {
    console.log(stderr + "err");
  } else {
    console.log(stdout);
  }
});

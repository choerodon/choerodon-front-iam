const config = {
  local: true, //是否为本地开发
  clientId: 'localhost', // 必须填入响应的客户端（本地开发）
  titlename: 'Choerodon', //项目页面的title名称
  favicon: 'favicon.ico', //项目页面的icon图片名称
  theme: true, //是否开启主题色设定
  mainCss: JSON.stringify('boot'), //master选择哪个项目的主题
  Masters: JSON.stringify('boot'), //master选择哪个项目模块
  Home: JSON.stringify('iam'), //Home选择哪个项目模块
  themeSetting: {
    antdTheme: {
      'primary-color': '#3F51B5', //antd的主题颜色设定
    },
    header: '#3F51B5', //头部主题颜色设定
    // header: 'rgb(59,120,231)', //头部主题颜色设定
    backgroundColor: 'white', //背景色主题颜色设定
  },
  cookieServer: '', //子域名token共享
  server: 'http://api.choerodon.com.cn',
  webpackConfig: '', //webpack扩展配置，当未设定时默认为webpack.config.js
};

module.exports = config;

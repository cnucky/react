# Install
需要`nodejs`环境，请至[https://nodejs.org](https://nodejs.org)下载。

## 安装npm开发工具

```
#全局安装都需要sudo，npm太慢可使用cnpm代替
npm install gulp -g # 编译工具
npm install pm2 -g # 服务部署，进程监护工具
npm install supervisor -g # 开发工具
npm install mocha -g # 集成测试工具 
#eslint
npm install -g eslint
npm install -g eslint-plugin-react
npm install -g eslint-plugin-html
```

## 开发
进入工程文件夹，执行`npm install`，这里千万不能sudo，否则以后都需要sudo。
执行`gulp`构建工程，浏览器访问[http://localhost:3000](http://localhost:3000)

## 部署
执行`sh devtools/git-hook-publish.sh`即可

## 测试
工程目录下执行`mocha`，测试资源在`test`目录中。


# gulp工具使用

```
gulp  # 进入开发调试模式
gulp release  # 编译发布release版本
gulp init --name xxx  # 新建一个子项目
gulp publish --name xxx  # 将子项目打包到dist
gulp apply --path /path/folder  # 从指定目录部署打包好的子项目
gulp clean  # 清理编译文件
```
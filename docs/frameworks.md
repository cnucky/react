# framework 使用说明

`framework`提供了一个供各业务解耦的框架，业务方只需要关注自己的页面功能，独立研发，最后再整合进整个系统即可。因为整个框架在原系统基础之上，提供了一些框架级别的通用功能，同时对业务方也有一定的限制。

## 1. 添加一个“业务子项目”
在`business`目录下创建一个业务目录。目录结构如下：

```
business
  [module name]  # e.g. max  
    router.js # 业务方路由配置，用于web服务加载  
    entry.js  # 业务方页面入口js配置表，用于webpack打包
    jws # 自动生成的后台服务API
    router # express路由的实现
    src # 业务方静态资源目录，框架gulp task会对以下目录进行处理，请严格按照目录结构设置
      js  # js文件，用于放置业务js
      less  # 样式目录
      fonts # 业务方自定义字体
      img   # 业务方图片
      locales # 业务方本地化资源
      html  # 业务方页面
```  

js目录下推荐结构如下：

```
js
  module  # 放置各个模块，按照功能组织
  pages   # 页面入口
  widget  # 业务方自定义组件
  ...
```

**注意**  
  
*  后台服务的实现，框架不做限制，只需要配置好`router.js`里的路由规则即可。`router`、`jws`、`utils`等目录均是推荐配置。
*  jws可通过在业务子目录下添加一个`serverConfig`配置，执行`node ./devtools/method-generator.js --path xxx/serverConfig.js`，生成相应的服务。

## 2. js模块依赖管理  

node_modules下模块由框架进行管理，如果需要添加、更新通用模块，需要项目负责人申请。
位于public目录下的公共组件也可使用, 若是在webpack中配置了alias，加载方式为`require('[alias name]')，类似于加载node_modules下的模块;其他组件可用相对于public目录路径加载。

## 3. html开发注意事项
`html`中需要引用`css`、`js`、`fonts`等静态类型资源，除`js`外，引用路径均以`${ctxRoot}/css/...`、`${ctxRoot}/fonts/...`引用，编译期间会将`${ctxRoot}`替换为`业务模块`相对应的目录。  

对于`js`分两种类型：

1.   `js-components`下的公共资源，直接以绝对路径引用`/js/components/...`
2.   `[module name]/src/js`下的页面入口`js`，需要以`${entryRoot}/[entry].js`。

## 4. 国际化
公共国际化的资源位于`src/locales`，各业务模块推荐放置在`[module name]/src/locales下`。资源目录按照页面或者功能来组织，以建模页面为例:

```
locales
   modeling
     zh.json
     en.js  # js文件可以引用公共资源，如require('../common/en.json')
   common
  	 zh.json
  	 en.json
```
在各页面入口调用`initLocales(localeContext)`方法初始化,`localContext`通过`require.context([locale path], false, /\.js/)`获得。

*  html文件中给需要国际化的标签加上data-i18n="[target-attr]key"，target-attr和key分别是目标属性和资源标识
*  js中通过i18n.t(namespace:key)获取资源
*  jsx与js同理，React组件用`widget/i18n-provider`提供的Provider包起来,从组件context中获得i18n
*  公共组件应该有独立的资源文件，调用`registerLocales(localeContext, ns)`注册组件资源。

## 5. 配置“framework.config.js”
配置文件格式如下：

```
{
  '[module name]': 'business目录'
}
```
通常这两个可以同名，为了避免和总业务的命名冲突，`[module name]`可自行更改。

## 6. 调试
执行`gulp`,在浏览器中访问`http://[host]:3000/[module name]/[page]`。

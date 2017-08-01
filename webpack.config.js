var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

// var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

var providePlugin = new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery",
    "window.jQuery": "jquery",
    jqxBaseFramework: 'jquery',
    _: 'underscore',
    "window._": "underscore",
})


var HappyPack = require('happypack');

var context = path.join(__dirname, '/framework/src/js/');
// 便于跨业务引用资源
var businessBase = __dirname;
var public = path.join(__dirname, '/public/');

function Config(entry, outputName) {
    outputName = outputName || './';
    this.context = context;
    this.entry = entry;
    this.output = {
        path: path.join(__dirname, '_build/', outputName, 'js/'),
        publicPath: path.join('/', outputName, 'js/'),
        filename: '[name].js'
    }
    this.externals = {
        q: 'Q',
        jquery: 'jQuery',
        underscore: '_',
        react: 'React',
        i18next: 'i18next',
        echarts: 'echarts',
        'jquery-i18next': 'jqueryI18next',
        'react-dom': 'ReactDOM',
        'react-i18next': 'window["react-i18next"]',
        'i18next-xhr-backend': 'i18nextXHRBackend',
        // 'angular':'angular',
        // 'angular-route':'angular-route',

        /* should not require('jquery-ui'), remove followings */
        'jquery-ui': 0,
        'fancytree-all': 0,
        'utility/fancytree/jquery.fancytree-all': 0,
        'utility/fancytree/extensions/jquery.fancytree.filter': 0,
        'utility/fancytree/extensions/jquery.fancytree.childcounter': 0,
        'jquery.magnific-popup': 0,
        'utility/magnific-popup/jquery.magnific-popup': 0
    }
    this.module = {
        loaders: [{
            test: /jquery\.js$/,
            loader: 'expose?$!expose?jQuery!expose?minQuery!expose?jqxBaseFramework'
        }, {
            test: /\.jsx$/,
            loader: 'happypack/loader'
        }, {
            test: /\.html?$/,
            loader: 'tpl-loader'
        }, {
            test: /\.less$/,
            loader: 'style!css!less'
        }, {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }, {
            test: /\.json$/,
            loader: 'json'
        }

        ],

    }
    this.resolveLoader = {
        root: path.join(__dirname, "node_modules"),
        alias: {
            "tpl-loader": path.join(__dirname, "./devtools/webpack-loaders/tpl-loader")
        }
    }
    this.resolve = {
        root: [context, businessBase],
        modulesDirectories: ['node_modules', public],
        extensions: ["", ".js", ".html", ".jsx", '.es', ".css", ".less"],
        alias: {
            // 'q': context + 'lib/q',
            // 'jquery': context + 'lib/jquery',
            // 'underscore': context + 'lib/underscore',
            // 'jquery-ui': context + 'lib/jquery-ui',
            // 'bootstrap': context + 'lib/bootstrap',
            'bootstrap-multiselect': public + 'utility/bootstrap/bootstrap-multiselect',
            'jquery.validate': public + 'utility/jquery/jquery.validate.min',
            // 'fancytree-all': context + 'utility/fancytree/jquery.fancytree-all',
            'pnotify': public + 'utility/pnotify/pnotify',
            // 'History': context + 'lib/jquery.history',
            // 'bootbox': context + 'utility/bootbox/bootbox',
            'moment': public + 'utility/moment/moment',
            'moment-locale': public + 'utility/moment/locale/zh-cn',

            'udp-dropzone': context + 'module/udp/dropzone',
            'jquery.datatables': public + 'utility/jquery/jquery.datatables.min',
            'datatables.colResize': public + 'utility/datatables/datatables.colResize',
            'datatables.bootstrap': public + 'utility/datatables/datatables.bootstrap',
            'datetimepicker': public + 'utility/datepicker/bootstrap-datetimepicker',

            // tagsinput, 涉及页面较多暂留。但新模块不建议require
            'tagsinput': public + 'utility/tagsinput/tagsinput',
            'bootstrap-tagsinput': public + 'utility/tagsinput/bootstrap-tagsinput',
            'nova-alert': public + 'widget/dialog/nova-alert',
            'nova-dialog': public + 'widget/dialog/nova-dialog',
            'nova-iframe-dialog': public + 'widget/dialog/nova-iframe-dialog',
            'nova-double-bootbox-dialog': 'widget/dialog/nova-double-bootbox-dialog',
            'nova-bootbox-dialog': public + 'widget/dialog/nova-bootbox-dialog',
            'nova-home-dialog': public + 'widget/dialog/nova-home-dialog',
            'nova-empty-dialog': public + 'widget/dialog/nova-empty-dialog',
            'nova-notify': public + 'widget/dialog/nova-notify',
            'udp-file-util': context + 'widget/udp-file-util',

            'nova-code': path.join(__dirname, '/utils/code.js'),
            'nova-map-dialog': public + 'widget/dialog/nova-map-dialog',

            'config': path.join(__dirname, '/config/config.js'),
            'config-system': path.join(__dirname, '/utils/config-system.js'),
            'bootstrap-colorpicker': public + 'utility/bootstrap/bootstrap-colorpicker.js',
            'jquery.mousewheel': public + 'utility/jquery/jquery.mousewheel'

        }
    }
    this.plugins = [
        //new webpack.HotModuleReplacementPlugin(),
        providePlugin,
        new HappyPack({loaders: ['babel']})
        /*new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            except: ['$super', '$', 'exports', 'require']
        })*/
    ]

}

var defaultConfig = new Config({
    vendor: [
        // './lib/jquery',
        // './lib/underscore',
        // './lib/jquery-ui',
        // './lib/bootstrap',
        './index.js',
        './i18n.js'
    ],
    'home': './pages/home.jsx',
    'login': './pages/user/login.js',
    'test': './pages/test/test.jsx',
    'smalltoolset': './pages/smalltoolset/smalltoolset.js',
    'personal-profile': './pages/personal/personal-profile.js',
    'add-user': './pages/user/add-user.js',
    'departments': './pages/group/departments.js',
    'groups': './pages/group/groups.js',
    'modify-password': './pages/user/modify-password.js',

    'role-manager': './pages/role/role-manager.js',
    'user-authority': './pages/role/user-authority.js',
    'workspace': './pages/workspace/workspace.js',

    'sc-frame': './pages/shortcut/sc-frame.js',

    'message': './pages/message/message.js',
    'noticemanage': './pages/message/noticemanage.js',

    'log': './pages/log/log.js',
    'log-query': './pages/log/log-query.js',
    'log-record': './pages/log/log-record.js',

    'appstore': './pages/appstore/appstore.jsx',
    'appmanage': './pages/appstore/appmanage.jsx',
    'app-publish': './pages/appstore/app-publish.jsx',
    'tbl-design' : './pages/tabledesign/tbl-design.js',

    'workprocesslist': './pages/workprocess/workprocesslist.js',
    'workprocess': './pages/workprocess/workprocess.js',
    'processinfo': './pages/workprocess/processinfo.js',
    'processmatenance': './pages/workprocess/processmatenance.js',

});

function createConfig(dev) {
    if (!dev) {
        var frameworkConfig = require('./framework.config');
        var out = [];
        _.each(frameworkConfig, function(dir, name) {
            var entryPath = path.join(__dirname, dir, 'entry.js');
            var entry = {};
            if (fs.statSync(entryPath).isFile()) {
                var entryConfig = require(entryPath);
                _.each(entryConfig, function(value, key) {
                    entry[key] = path.join(__dirname, dir, 'src/js', value);
                });
            }
            if(name === 'main') {
                defaultConfig.entry = _.extend({}, defaultConfig.entry, entry);
            } else {
                out.push(new Config(entry, name));
            }
        })
        out.unshift(defaultConfig);
        return out;
    } else {
        var copyedConfig = _.clone(defaultConfig);
        // add framework
        var frameworkConfig = require('./framework.config');
        _.each(frameworkConfig, function(dir, name) {
            var entryPath = path.join(__dirname, dir, 'entry.js');
            if (fs.statSync(entryPath).isFile()) {
                var entryConfig = require(entryPath);
                // put framework entry to webpack entry
                _.each(entryConfig, function(value, key) {
                    copyedConfig.entry[name + '/' + key] = path.join(__dirname, dir, 'src/js', value);
                });
            }
        })
        return copyedConfig;
    }
}

module.exports.config = defaultConfig;
module.exports.createConfig = createConfig;

var gulp = require('gulp');
var gutil = require('gulp-util');
// var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var Path = require('path');
var exec = require('child_process').exec;
var less = require('gulp-less');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var plumber = require('gulp-plumber');
var webserver = require('gulp-webserver');
var shell = require('gulp-shell');
var clean = require('gulp-clean');
var file = require('gulp-file');
var argv = require('yargs').argv;
var _ = require('underscore');
var webpack = require("webpack");
var fs = require('fs');

var workspace = __dirname + '/';

var compileShim = require('./devtools/gulp-compile/compile-shim');
var compilePlaceholder = require('./devtools/gulp-compile/compile-placeholder');
var compileEmpty = require('./devtools/gulp-compile/compile-empty');
var shims = {};

gulp.task('nowatch', function(cb) {
    watch = compileEmpty;
    cb();
});

gulp.task('less', function() {
    var path = ['framework/src/less/**/*.less'];
    gulp.src(path)
        .pipe(watch(path, {}, logVinyl))
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest('_build/css'));
});

gulp.task('css', function() {
    var path = ['framework/src/less/**', '!framework/src/less/**/*.less'];
    gulp.src(path)
        .pipe(watch(path, {}, logVinyl))
        .pipe(gulp.dest('_build/css'));
});

gulp.task('html', function() {
    var path = 'framework/src/html/**/*.*';
    gulp.src(path)
        .pipe(watch(path, {}, logVinyl))
        .pipe(compileShim(function(file) {
            shims[file] = true;
        }))
        .pipe(compilePlaceholder())
        .pipe(gulp.dest('_build/'));
});


gulp.task('jscomponents', function() {
    var path = ['public/js-components/**'];
    gulp.src(path)
        .pipe(gulp.dest('_build/js/components/'));
});

// gulp.task('shim', function () {
//     gulp.src('src/html/**/*.html')
//     .pipe(compileShim(function (file) {
//         console.log(98, file);
//     }))
//     .pipe(gulp.dest('_build/'))
// })

gulp.task('img', function() {
    var path = 'framework/src/img/**/*.*';
    gulp.src(path)
        .pipe(watch(path, {}, logVinyl))
        .pipe(gulp.dest('_build/img'));
});

gulp.task('fonts', function() {
    var path = 'framework/src/fonts/**';
    gulp.src(path)
        .pipe(gulp.dest('_build/fonts'));
});

// gulp.task('locales', function() {
//     var path = 'src/locales/**';
//     gulp.src(path)
//         .pipe(watch(path, {}))
//         .pipe(gulp.dest('_build/locales'));
// })

// frameworks
var frameworkTasks = [];
var frameworkConfig = require('./framework.config');
_.each(frameworkConfig, function(dir, name) {
    // copy css/less/img/fonts/locales
    var outputPath = name == 'main' ? '' : name;
    var taskName = name + 'less';
    gulp.task(taskName, function() {
        var path = [Path.join(dir, 'src/less/**/*.less')];
        gulp.src(path)
            .pipe(watch(path, {}, logVinyl))
            .pipe(plumber())
            .pipe(less())
            .pipe(gulp.dest('_build/' + outputPath + '/css'));
    })
    frameworkTasks.push(taskName);

    taskName = name + 'css';
    gulp.task(taskName, function() {
        var path = [Path.join(dir, 'src/less/**/*.css')];
        gulp.src(path)
            .pipe(watch(path, {}, logVinyl))
            .pipe(gulp.dest('_build/' + outputPath + '/css'));
    })
    frameworkTasks.push(taskName);

    _.each(['img', 'fonts'], function(type) {
        taskName = name + type;
        gulp.task(taskName, function() {
            var path = [Path.join(dir, 'src/' + type + '/**')];
            gulp.src(path)
                .pipe(watch(path, {}, logVinyl))
                .pipe(gulp.dest('_build/' + outputPath + '/' + type));
        })
        frameworkTasks.push(taskName);
    })

    // html
    taskName = name + 'html';
    gulp.task(taskName, function() {
        var path = [Path.join(dir, 'src/html/**/*.*')];
        gulp.src(path)
            .pipe(watch(path, {}, logVinyl))
            .pipe(compileShim(function(file) {
                shims[file] = true;
            }))
            .pipe(compilePlaceholder({
                ctxRoot: '/' + outputPath,
                entryRoot: Path.join('/', outputPath, 'js')
            }))
            .pipe(gulp.dest('_build/' + outputPath));
    });
    frameworkTasks.push(taskName);
})

gulp.task('frameworks', frameworkTasks);


gulp.task('shim', function() {
    _.each(shims, function(val, file) {
        touchFile(file);
    })
});

gulp.task('watchShim', function() {
    gulp.watch('framework/src/html/index.html', ['shim']);
});

gulp.task('precompile', function() {
    //预编译检查
})

gulp.task('webpack', function(callback) {
    webpack(require('./webpack.config.js').createConfig(), function(err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({}));
        callback();
    });
})

gulp.task('express', shell.task([
    'supervisor -w app.js,framwork/route,framework/utils,framework/jws -- app.js --dev' + (argv.mock ? ' --mock' : '') + (argv.web ? ' --web' : '')
]));

gulp.task('clean', function() {
    gulp.src(['./_build', '.happypack'])
        .pipe(clean());
});

gulp.task('config',shell.task(['node devtools/config-generator.js']));

gulp.task('init', function() {
    // 新建子业务模板目录
    var name = argv.name;
    if (name) {
        var root = 'business/' + name;
        var dirs = [root, root + '/jws', root + '/route', root + '/src', root + '/src/html', root + '/src/img',
            root + '/src/less', root + '/src/js', root + '/src/js/module', root + '/src/js/pages', root + '/src/js/tpl'
        ];
        dirs.forEach(function(dir) {
            fs.mkdirSync(dir);
        });

        var configjs_file = "var _ = require('underscore');\n" +
            "var config = require('../../config/config');\n" +
            "var configValue;\n\n" +
            "configValue = {};\n\n" +
            "_.each(_.keys(config), function(itemKey){\n" +
            "\tif(configValue[itemKey] != undefined) return;\n" +
            "\tconfigValue[itemKey] = config[itemKey];\n});\n\n" +
            "module.exports = configValue;";

        fs.writeFileSync(root + '/config.js', configjs_file);
        fs.writeFileSync(root + '/entry.js', 'module.exports = {}');
        fs.writeFileSync(root + '/router.js', "var router = require('express').Router();\n\nmodule.exports = router;");
        fs.writeFileSync(root + '/serviceConfig.js', "var config = require('./config');\n\nmodule.exports = {}");
        var config = require('./framework.config.js');
        config[name] = root;
        fs.writeFileSync('./framework.config.js', 'module.exports = ' + JSON.stringify(config, null, '\t'));
        console.log('Project "' + name + '" initialized in' + root);
    } else {
        console.log('Please pass name as arguments. Do nothing and return');
    }
})

gulp.task('publish', function() {
    // 发布打包
    var name = argv.name;
    var config = require('./framework.config');
    if(name) {
        var rootPath = config[name];
        if(rootPath) {
            gulp.src([Path.join(rootPath, '!(src)/**/*.*'), Path.join(rootPath, '@(config|entry|router|serviceConfig).js')])
                .pipe(gulp.dest(Path.join('dist', name)));

            var buildPath = name == 'main' ? './' : name;
            gulp.src(Path.join('_build', buildPath, '/**/*.*')).pipe(gulp.dest(Path.join('dist', name, '_build')));
            file('package.json', JSON.stringify({
                name: name,
                target: rootPath,
                time: new Date().toString()
            }, null, '\t'), {src: true}).pipe(gulp.dest(Path.join('dist', name)));
            console.log('publish "' + name + '" DONE');
        } else {
            console.log('Project "' + name + '" not exists')
        }
    } else {
        console.log('Please pass name as arguments. Do nothing and return');
    }
})

gulp.task('publish-batch', function() {
    // 发布打包
    var config = require('./framework.config');
    _.each(config,function(path,name){
        var rootPath = path;
        if(rootPath) {
            gulp.src([Path.join(rootPath, '!(src)/**/*.*'), Path.join(rootPath, '@(config|entry|router|serviceConfig).js')])
                .pipe(gulp.dest(Path.join('dist', name)));
            var buildPath = name == 'main' ? './' : name;
            gulp.src(Path.join('_build', buildPath, '/**/*.*')).pipe(gulp.dest(Path.join('dist', name, '_build')));
            file('package.json', JSON.stringify({
                name: name,
                target: rootPath,
                time: new Date().toString()
            }, null, '\t'), {src: true}).pipe(gulp.dest(Path.join('dist', name)));
            console.log('publish "' + name + '" DONE');
        } else {
            console.log('Project "' + name + '" not exists')
        }
    })
})

gulp.task('apply', function() {
    var path = argv.path;
    if(path) {
        var info = JSON.parse(fs.readFileSync(Path.join(path, 'package.json')).toString());
        if(info) {
            var config = require('./framework.config');
            if (config[info.name]){
                exec('rm -rf _build/' + info.name);
                exec('rm -rf business/' + info.name);
                delete config[info.name];
                fs.writeFileSync('./framework.config.js', 'module.exports = ' + JSON.stringify(config, null, '\t'))
            }
            gulp.src([Path.join(path, '!(_build)/**/*.*'), Path.join(path, '@(config|entry|router|serviceConfig).js')])
                .pipe(gulp.dest(Path.join(info.target)));
            var outputPath = info.name == 'main' ? './' : info.name;
            gulp.src(Path.join(path, '_build/**/*.*')).pipe(gulp.dest(Path.join('_build', outputPath)));
            config[info.name] = info.target;
            fs.writeFileSync('./framework.config.js', 'module.exports = ' + JSON.stringify(config, null, '\t'))
        } else {
            console.log('Something wrong.')
        }
    } else {
        console.log('Please pass path as arguments. Do nothing and return');
    }
})

gulp.task('delete', function() {
    var name = argv.name;
    if (name){
        var config = require('./framework.config');
        var isAppExist = config[name];
        if (isAppExist){
            exec('rm -rf _build/' + name);
            exec('rm -rf business/' + name);
            delete config[name];
            fs.writeFileSync('./framework.config.js', 'module.exports = ' + JSON.stringify(config, null, '\t'))
        }else {
            console.log('app ' + argv.name + ' do not exist');
        }
    } else {
        console.log('Please pass name as arguments. Do nothing and return');
    }
});

function touchFile(file) {
    exec('touch ' + workspace + file);
}

function logVinyl(file) {
    console.log('[' + (new Date().toTimeString().substring(0, 8)).gray + ']',
        'gulp:',
        Path.basename(file.path).green);
}

gulp.task('build', ['less', 'css', 'html', 'img', 'fonts', 'jscomponents', 'frameworks', 'config']);

gulp.task('default', ['build', 'express', 'watchShim']);
// gulp.task('web', ['build', 'webserver', 'watchShim']); // 调试web使用
gulp.task('release', ['nowatch', 'build', 'webpack']);
gulp.task('test', ['nowatch', 'img']);

// gulp.task('default', function () {
//  gulp.watch('js/**/*.js', ['js']);
// });

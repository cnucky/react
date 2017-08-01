var request = require('request');
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var _ = require('underscore');
var fs = require('fs');
var colors = require('colors');

var Path = require('path');
var filepath = process.argv[1];
var args = require('minimist')(process.argv.slice(2));
var workspace = Path.normalize(Path.dirname(filepath) + '/../');

var tpl = _.template(fs.readFileSync(workspace + '/devtools/method-tpl.js').toString());

var appConfig;
if(args.path){
    var config_str = args.path.substring(0, args.path.lastIndexOf('/'));
    appConfig = require(Path.join(process.cwd(), config_str + '/config'));
}
else{
    appConfig = require(workspace+'framework/config');
}

var config;
config = args.path ? require(Path.join(process.cwd(), args.path)) : require(workspace+'framework/serviceConfig');

_.each(config, generate);

// var url = process.argv[2];
// var url = 'http://192.168.0.3:8080/axis/LoginService.jws?wsdl';

function generate(service, name) {
    var url = 'http://' + appConfig[service.role] + service.url;
    request(url, function(err, rsp, body) {

        parseString(body, function(err, wsdl) {
            var operations;
            try {
                operations = wsdl['wsdl:definitions']['wsdl:portType'][0]['wsdl:operation'];
            } catch (e) {
                console.log('Generate failed: '.red, url.green);
            }
            if (!operations) {
                return;
            }

            var methods = [];
            operations.forEach(function(operation) {
                methods.push({
                    name: operation['$']['name'],
                })
            });

            methods = _.sortBy(methods, function(a, b) {
                return a.name;
            });

            var appconfig = '../config.js';

            var data = {
                role: service.role,
                url: service.url,
                methods: methods,
                appconfig: appconfig
            };

            var content = tpl(data);
            if (args.path) {
                fs.writeFileSync(Path.join(process.cwd(), args.path, '../jws/' + name + '.js'), content);
            } else {
                fs.writeFileSync(workspace + 'framework/jws/' + name + '.js', content);
            }
            console.log('Generate: '.gray, url.green);
        });
    });
}

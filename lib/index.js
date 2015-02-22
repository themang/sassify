"use strict";

var sass = require("node-sass");
var path = require("path");
var extend = require('util')._extend;
var tools = require('browserify-transform-tools');
var rework = require('rework');
var reworkUrl = require('rework-plugin-url');
var CleanCSS = require('clean-css');

module.exports = tools.makeStringTransform('desassify', {
    includeExtensions: ['.css', '.sass', '.scss'],
    evaluateArguments: true
}, function(content, opts, done) {
    var inject = (typeof opts.config !== 'undefined' && typeof opts.config['auto-inject'] !== 'undefined') ? opts.config['auto-inject'] : false;
    var file = opts.file;

    var options = extend({}, opts.config || {});
    options.includePaths = extend([], (opts.config ? opts.config.includePaths : []) || []);
    options.includePaths.unshift(path.dirname(opts.file));
    options.indentedSyntax = /\.sass$/i.test(opts.file);

    options.file = file;
    options.data = content;
    options.outFile = opts.file;
    options.outputStyle = 'compressed';

    opts = opts.opts;
    options.success = function (css) {
        
        css = css.css;

        if (opts.rewriteUrl) {
            css = rework(css)
              .use(reworkUrl(function(url) {
                return opts.rewriteUrl(url, options.file);
              }))
              .toString()
        }

        if (opts.minify) {
          css = new CleanCSS(opts.minify).minify(css);
        }

        var filePath = path.relative(process.cwd(), file);
        if (filePath.indexOf('node_modules') === 0) {
            filePath = filePath.slice('node_modules'.length);
        }
        css = css + '\n/*# sourceURL=' + filePath + '*/'

        var exp;
        if (inject) {
            exp = "require('" + path.dirname(__dirname) + "')(" + JSON.stringify(css) + ");";
        } else {
            exp = JSON.stringify(css);
        }
        var out = "module.exports = " + exp + ";";
                
        done(null, out);
    };
    options.error = function(error) {
        done(error);
    }

    sass.render(options);
});
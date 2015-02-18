"use strict";

var sass = require("node-sass");
var path = require("path");
var extend = require('util')._extend;
var tools = require('browserify-transform-tools');
var rework = require('rework');
require('rework-plugin-url');

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
    options.sourceComments = false;
    options.sourceMap = true;
    options.outFile = opts.file;
    options.sourceMapEmbed = true;
    options.sourceMapContents = true;
    options.outputStyle = 'compressed';
    options.success = function (css) {
        
        css = css.sss;

        if (opts.rewriteUrl) {
            css = rework(css)
              .use(rework.url(opts.rewriteUrl))
              .toString()
        }

        if (opts.minify) {
          css = new CleanCSS(opts.minify).minify(css);
        }

        var exp;
        if (inject) {
        	exp = "require('" + path.dirname(__dirname) + "').byUrl('" + (function() {
        		var b64 = (new Buffer(css)).toString('base64');
        		return 'data:text/css;base64,' + b64;
        	})() + "');";
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
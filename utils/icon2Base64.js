#!/usr/bin/env node

// Reads through the library descriptor file (i.e. "widgets.json"), converting
// images specified by the "icon" properties to a base64 representation. Base64
// string is saved as "iconBase64" property.

var fs = require('fs'),
    util = require('util'),
    path = require('path');

var descriptor;

if (process.argv.length < 3) {
    printHelp();
}

// read in descriptor file
var descriptorPath = fs.realpathSync(process.argv[2]);
fs.readFile(descriptorPath, "utf8", function(err, data) {
    if (err) throw err;

    var descriptor = jsonParse(data, descriptorPath);
    var dirname = path.dirname(descriptorPath);
    
    descriptor.widgets.forEach(function(widget, idx) {
        if (widget.icon) {
            var iconPath = path.join(dirname, widget.icon);
            var base64 = new Buffer(fs.readFileSync(iconPath), "binary").toString("base64");
            
            var type = path.extname(widget.icon).substr(1).toLowerCase();
            var iconBase64 = "data:image/" + type + ";base64," + base64;
            
            // put 'iconBase64' after 'icon'
            var newWidget = {};
            for (var p in widget) if (widget.hasOwnProperty(p)) {
                // copy props to 'newWidget', skipping 'iconBase64', which is handled next
                if (p !== "iconBase64") {
                    newWidget[p] = widget[p];
                }
                if (p === "icon") {
                    newWidget.iconBase64 = iconBase64;
                }
            }
            descriptor.widgets[idx] = newWidget;
        }
    });
    
    // write out new widgets.json
    fs.writeFile(descriptorPath, JSON.stringify(descriptor, null, "    "), "utf8", function(err) {
        if (err) throw err;
    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////
//////////          Utility methods          ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function printHelp() {
    util.log("Usage: node icon2Base64.js widgets.json");
    process.exit(1);
}

function debug(msg, filepath) {
    util.debug((filepath ? "[" + filepath + "] : \n       " : "") + msg);
}

function jsonParse(data, filepath) {
    try {
        // XXX Don't use JSON.parse() since some of the metadata files may not be valid JSON.
        //     Instead, just use eval().
        // return JSON.parse( data );
        return eval( '(' + data + ')' );
    } catch(e) {
        debug("ERROR: failed to parse JSON ", filepath);
        throw e;
    }
}

function enumerateDir(dir, filter, func) {
    fs.readdir(dir, function(err, files) {
        if (err) throw err;

        files.forEach(function(val, index, array) {
            var filepath = dir + '/' + val;
            fs.stat(filepath, function(err, stats) {
                if (err) throw err;
                if (stats.isDirectory()) {
                    enumerateDir(filepath, filter, func);
                }
                
                // check against file path filter regexp
                if (filter && !filter.test(filepath)) {
                    return;
                }
                
                // invoke callback
                func(filepath);
            });
        });
    });
}

function enumerateDirSync(dir, filter, onFile, onEnd) {
    var files = fs.readdirSync(dir);
    files.forEach(function(val, index, array) {
        var filepath = dir + '/' + val;
        if (fs.statSync(filepath).isDirectory()) {
            enumerateDirSync(filepath, filter, onFile);
        }
        
        // check against file path filter regexp
        if (filter && !filter.test(filepath)) {
            return;
        }
        
        // invoke callback
        onFile(filepath);
    });
    
    if (onEnd) {
        onEnd();
    }
}

#!/usr/bin/env node

// Updates a widgets.json library descriptor files adding icon, iconBase64, iconLarge and iconLargeBase64 properties. 
// Verifies that the appropriate icon files are in the appropriate folders, and
// prints errors messages if anything is amiss.
//
// Assumes that the script is run from the maqetta/utils/ folder and that the corresponding icons are
// are in folder ../resources/imagesLarge folder (relative to the widgets.json file) and that the icon names
// match the widget name property (<widgetname>.png). 

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
		var iconFileName;
		// Special case for HTML widgets, where widget name is <a>, <p>, etc.
		if(widget.type.indexOf('html.')==0){
			iconFileName = widget.type.substr(5);
		}else{
			iconFileName = widget.name;
		}
		var iconSmallPath = path.join(dirname, 'resources/images/'+iconFileName+'.png');
		if(!fs.existsSync(iconSmallPath)){
			if(widget.hidden !== true && widget.hidden !== 'true' && widget.category != 'untested'){
				console.error('Icon file not found: '+iconSmallPath);
			}
		}else{
			var base64 = new Buffer(fs.readFileSync(iconSmallPath), "binary").toString("base64");
			var iconBase64 = "data:image/png;base64," + base64;
			widget.icon = path.relative(dirname, iconSmallPath);
			widget.iconBase64 = iconBase64;
		}
		var iconLargePath = path.join(dirname, 'resources/imagesLarge/'+iconFileName+'.png');
		if(!fs.existsSync(iconLargePath)){
			if(widget.hidden !== true && widget.hidden !== 'true' && widget.category != 'untested'){
				console.error('Icon file not found: '+iconLargePath);
			}
		}else{
			var base64 = new Buffer(fs.readFileSync(iconLargePath), "binary").toString("base64");
			var iconBase64 = "data:image/png;base64," + base64;
			widget.iconLarge = path.relative(dirname, iconLargePath);
			widget.iconLargeBase64 = iconBase64;
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
    util.log("Usage: node icon2Base64.js <path-to-widgets.json-file>");
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

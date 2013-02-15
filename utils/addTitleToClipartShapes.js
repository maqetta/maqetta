#!/usr/bin/env node

// Adds a 'title' property to each of the clipart or shapes OAM files (depending on command-line parameter)
//
// Assumes that the script is run from the maqetta/utils/ folder

var fs = require('fs'),
    util = require('util'),
    path = require('path');

var descriptor;

if (process.argv.length < 3) {
    printHelp();
}

var libraryName = process.argv[2];
if(libraryName != 'clipart' && libraryName != 'shapes'){
    printHelp();
}
var titleString = libraryName=='clipart' ? 'Clipart icon: ' : 'Drawing tool: ';

var osgiProjectName = 'maqetta.'+libraryName;
var pathToWidgetsJson = '../'+osgiProjectName+'/WebContent/metadata/widgets.json';

// read in descriptor file
var descriptorPath = fs.realpathSync(pathToWidgetsJson);
fs.readFile(descriptorPath, "utf8", function(err, data) {
    if (err) throw err;

    var descriptor = jsonParse(data, descriptorPath);
    var dirname = path.dirname(descriptorPath);
    descriptor.widgets.forEach(function(widget, idx) {
		var oamFileName = path.join(dirname, widget.type.replace('.','/')) + '_oam.json';
		if(!fs.existsSync(oamFileName)){
			console.error('oam file not found: '+oamFileName);
		}else{
			fs.readFile(oamFileName, "utf8", function(err, oamdata) {
			    if (err) throw err;
			    var oam = jsonParse(oamdata, oamFileName);
				oam.title = {
			        "type": "text/html",
			        "value": "<p>"+titleString+widget.name+"</p>"
			    };
			    fs.writeFile(oamFileName, JSON.stringify(oam, null, "    "), "utf8", function(err) {
			        if (err) throw err;
			    });
			});
		}
    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////
//////////          Utility methods          ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function printHelp() {
    util.log("Usage: node icon2Base64.js <clipart|shapes>");
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

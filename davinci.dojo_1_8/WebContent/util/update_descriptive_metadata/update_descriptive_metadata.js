#!/usr/bin/env node

/**
 * This requires the sax-js and jsDom packages to Node. Install with following
 * commands, in same directory as script:
 *      npm install sax@0.2.3
 *      npm install jsdom@0.2.3
 */

var fs = require('fs'),
    sys = require('sys'),
    path = require('path'),
    sax = require('sax'),
    jsdom = require('jsdom');

if ( process.argv.length < 4 ) {
    printHelp();
}

function printHelp() {
    sys.puts( "Usage: node findoamjson2.js <detailsxml> <rootdir>, where <detailsxml> typically is details.xml and <rootdir> typically is ../../metadata" );
    process.exit(1);
}

var regexOamJson = /_oam.json$/;
var traverseMetadataFolder = function(dir, done) {
  var results = [];
  //console.log('traverseMetadataFolder. dir='+dir);
  fs.readdir(dir, function(err, list) {
	//console.log('within readdir. list=');
	//console.dir(list);
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      var fullfile = dir + '/' + file;
      fs.stat(fullfile, function(err, stat) {
        if (stat && stat.isDirectory()) {
          traverseMetadataFolder(fullfile, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          //console.log('testing file:|'+fullfile+'|');
          if(regexOamJson.test(fullfile)){
	          //console.log('pushing file: '+fullfile);
	          results.push(fullfile);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

function parseDetailsFile(filepath, filedata, oamJsonFileList) {
    var doc = new (jsdom.dom.level3.core.Document)();
    var current = doc;
    var totalElements = 0;
// NOTE: Creating the parser in strict-mode (first parameter set to 'true') results in many error
//      messages about invalid or malformed comments.
//    var parser = sax.parser(true);
    var parser = sax.parser(false, {lowercasetags: true});
    
    parser.onopentag = function(node) {
        totalElements++;
        var element = doc.createElement(node.name);
        for (var key in node.attributes) if (node.attributes.hasOwnProperty(key)) {
            element.setAttribute(key, node.attributes[key]);
        };
        current.appendChild(element);
        current = element;
    };
    
    parser.onclosetag = function(elem) {
        current = current.parentNode;
    };
    
    parser.oncdata = parser.ontext = function(text) {
        var element = doc.createTextNode(text);
        current.appendChild(element);
    };
    
    parser.onerror = function(error) {
        sys.debug('[' + filepath + '] : \n       ' + error.message.replace(/\n/g, '\n       '));
        // delete error so parser can continue
        delete parser.error;
    };

    parser.onend = function() {
        if (doc.getElementsByTagName("*").length === totalElements) {
			console.log('parse complete. totalElements='+totalElements);
            // success -- now convert DOM to JSON
            //var json = convertToJson(doc);
//            sys.puts(JSON.stringify(json, null, "    "));
            //writeFile(filepath, json);
            processWidgetClasses(doc, oamJsonFileList);
        } else {
            sys.debug('[' + filepath + '] : \n       Conversion error: unexpected number of total elements');
        }
    };

    parser.write(filedata).close();
//    sys.puts(sys.inspect(doc, true, null));
}

// Return the text content of the given DOM element.
function innerText( elem ) {
    var text = elem.innerText || elem.textContent;
    if ( typeof text === "undefined" ) {
        text = "";
        var children = elem.childNodes;
        if (children) {
            for (var i = 0; i < children.length; i++) {
                var n = children.item(i);
                if (n.nodeType == 3 || n.nodeType == 4) {  // text or CDATA
                    text += n.nodeValue;
                }
            }
        }
    }
    return text.trim();
}

var processWidgetClasses = function(doc, oamJsonFileList){
	//DEBUGONLY: var attributesFound = [];
	//DEBUGONLY: var childElementsFound = [];
	var objectElements = doc.getElementsByTagName('object');
	// Strip off the leading path name (e.g., ../../metadata/) and trailing _oam.json
	var elementsOfInterest = {	// Map of element names in details.xml to oam prop names
		description:'description',
		summary:'title',
		examples:'examples'
	};
	var fileNameList = [];
	var fileNameMap = {};
	for(var i=0; i<oamJsonFileList.length; i++){
		var fileName = oamJsonFileList[i];
		fileNameList[i] = oamJsonFileList[i].substr(process.argv[3].length);
		if(fileNameList[i][0] == '/'){
			fileNameList[i] = fileNameList[i].substr(1);
		}
		fileNameList[i] = fileNameList[i].substr(0, fileNameList[i].indexOf('_oam.json'));
		fileNameMap[fileNameList[i]] = oamJsonFileList[i];
	}
	
	for(var oe=0; oe<objectElements.length; oe++){
		var objectElement = objectElements[oe];
		if(objectElement.hasAttribute('location')){
			//console.log(objectElement.getAttribute('location'));
			var location = objectElement.getAttribute('location');
			var index = fileNameList.indexOf(location);
			if(index >= 0){
				var fileName = fileNameMap[fileNameList[index]];
				//console.log('index>=0 fileName='+fileName);
				//DEBUGONLY: for(var attr=0; attr<objectElement.attributes.length; attr++){
				//DEBUGONLY: 	var attribute = objectElement.attributes.item(attr);
				//DEBUGONLY: 	attributesFound[attribute.name] = attribute.value;
				//DEBUGONLY: }
				var descriptiveProps = {};
				for(var ch=0; ch<objectElement.children.length; ch++){
					var child = objectElement.children.item(ch);
					if(elementsOfInterest[child.tagName]){
						descriptiveProps[child.tagName] = innerText(child);
					}
				}
				//DEBUGONLY: childElementsFound[child.tagName] = innerText(child);
				// Step 4: update the descriptive metadata fields in the *_oam.json file.
				//FIXME: Need to add description, summary->title and example
				fs.stat( fileName, function( fileName, descriptiveProps, err, stats ) {
					//console.log('inside fs.stat. fileName='+fileName);
				    if ( err ) throw err;
				    if ( stats.isFile() ) {
						//console.log('stat.isFile fileName='+fileName);
				        fs.readFile( fileName, "utf8", function( fileName, descriptiveProps, err, data ) {
				            if (err) throw err;
					        //console.log('Successful read of file: '+ fileName + 'data.length=' + data.length);
					
							// Use eval() instead of JSON.parse() because some of the oam.json files
							// contain comments, which are not allowed in JSON
							eval('var jsObj='+data);
							// Remove any existing props
							for(var prop in elementsOfInterest){
								delete jsObj[elementsOfInterest[prop]];
							}
							// Replace with values extracted from details.xml file
							for(var prop in descriptiveProps){
								jsObj[elementsOfInterest[prop]] = {};
								jsObj[elementsOfInterest[prop]].type = 'text/html';
								jsObj[elementsOfInterest[prop]].value = descriptiveProps[prop];
							}
							var jsonString = JSON.stringify(jsObj, null, "    ");
							fs.writeFile(fileName, jsonString);
				        }.bind(this, fileName, descriptiveProps));
				    } else {
				        sys.debug( "ERROR: not a valid file: " + fileName );
				    }
				}.bind(this, fileName, descriptiveProps));
				fileNameList.splice(index, 1);
			}
		}
	}
	//DEBUGONLY: console.log('attributesFound=');
	//DEBUGONLY: console.dir(attributesFound);
	//DEBUGONLY: console.log('childElementsFound=');
	//DEBUGONLY: console.dir(childElementsFound);
	if(fileNameList.length){
		console.log('OAM files for which there was no corresponding entry in details.xml file:');
		console.dir(fileNameList);
	}
}

// Step 1: First get a list of all *_oam.json files
traverseMetadataFolder(process.argv[3], function(err, results) {
	if (err) throw err;
	//console.log(results);
	console.log('_oam.json file list: results.length='+results.length);

	// Step 2: Then read the details.xml file and process it
	fs.stat( process.argv[2], function( err, stats ) {
	    if ( err ) throw err;
	    if ( stats.isFile() ) {
	        fs.readFile( process.argv[2], "utf8", function( err, data ) {
	            if (err) throw err;
				console.log('details.xml opened. data.length='+data.length);
				
	            // Step 3: Parse the details.xml file into a JSDOM.
				// Then, and for each classname that matches the name of an *_oam.json file, 
				// perform Step 4: update the descriptive metadata fields in the *_oam.json file.
	            parseDetailsFile( process.argv[2], data, results );
	        });
	    } else {
	        sys.debug( "ERROR: not a valid file: " + process.argv[2] );
	        printHelp();
	    }
	});

});

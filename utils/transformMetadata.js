#!/usr/bin/env node

var fs = require('fs'),
    util = require('util'),
    path = require('path');

var descriptor,
    metadataFiles = {};

if (process.argv.length < 3) {
    printHelp();
}

fs.stat(process.argv[2], function(err, stats) {
    if (err) throw err;
    if (stats.isDirectory()) {
        parseMetadataDir(process.argv[2]);
    } else {
        util.debug("ERROR: expected directory argument");
    }
});


////////////////////////////////////////////////////////////////////////////////////////////////////
//////////          Utility methods          ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function printHelp() {
    util.log("Usage: node transformDojoMetadata.js metadataDir");
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

////////////////////////////////////////////////////////////////////////////////////////////////////


function parseMetadataDir(dir) {
   // read in widget metadata files
   enumerateDirSync(dir,
       /.*_oam.json$/,
       function onFile(filepath) {
           var data = fs.readFileSync(filepath, "utf8");
           handleMetadataFile(filepath, data);
       },
       function onEnd() {
           // write out new metadata files for each widget
           for (var metadataPath in metadataFiles) if (metadataFiles.hasOwnProperty(metadataPath)) {
               var md = metadataFiles[metadataPath];

               // create new object, with specific properties order
               var order = [
                   "id",
                   "name",
                   "spec",
                   "version",
                   "sandbox",
                   "require",
                   "library",
                   "property",
                   "childProperties",
                   "content",
                   "javascript"
               ];
               var newMd = {};
               order.forEach(function(prop) {
                   if (md[prop]) {
                       newMd[prop] = md[prop];
                   }
                   delete md[prop];
               });
               
               // don't care about "xmlns" in JSON file
               delete md.xmlns;
               
               // check if any props still left in old metadata object
               for (var p in md)  if (md.hasOwnProperty(p)) {
                   debug("ERROR: unhandled property: " + p, metadataPath);
               }
               
               fs.writeFile(metadataPath, JSON.stringify(newMd, null, "    "), "utf8", function(err) {
                   if (err) throw err;
               });
           }
       }
   );
}

function handleMetadataFile(filepath, data) {
    if (path.basename(filepath).charAt(0) === "_") {
        debug("WARNING: this metadata file should be removed", filepath);
    }
    
    // store object
    var md = metadataFiles[filepath] = jsonParse(data, filepath);
    
    if (md.require && md.require.length) {
        var newReq = [];

        md.require.forEach(function(r) {
            if (r.type !== 'javascript') {
                newReq.push(r);
                return;
            }

            if (r.src && r.src.indexOf('dojo/dojo.js') !== -1) {
                md.library.dojo.src += r.src;
                return;
            }

            if (r.$text) {
                var m = r.$text.match(/dojo\.require\(['"]([^'"]+)['"]\)/);
                if (! m || ! m[1]) {
                    debug("ERROR: match for dojo.require failed (text = " + r.$text + ")");
                }
                delete r.$text;
                r.type = 'javascript-module';
                r.format = 'amd';
                r.src = m[1].replace(/\./g, '/'); // module id
                r.$library = 'dojo';
            }

            newReq.push(r);
        });

        md.require = newReq;
    }
}





// function parseMetadataDir(dir) {
//    // read in Dojo descriptor file
//    var descriptorPath = path.join(dir, "widgets.json");
//    var data = fs.readFileSync(descriptorPath, "utf8");
//    descriptor = jsonParse(data, descriptorPath);
   
//    // get params
//    var pName,
//        pLongName,
//        pVersion;
//    for (var i = 3; i < process.argv.length; i++) {
//        var item = process.argv[i];
//        var parts = item.split("=");
//        switch (parts[0]) {
//            case "--name":
//                pName = parts[1];
//                break;
//            case "--longname":
//                pLongName = parts[1];
//                break;
//            case "--version":
//                pVersion = parts[1];
//                break;
//        }
//    }
//    if (!pName || !pLongName || !pVersion) {
//        util.log("Usage: node transformDojoMetadata.js metadataDir --name=NAME --longname=LONGNAME --version=1.0");
//        process.exit(1);
//    }
   
//    var newDescriptor = {
//        name: pName,
//        longName: pLongName,
//        version: pVersion,
//        categories: {},
//        widgets: []
//    };
   
//    descriptor.forEach(function(category) {
//        var categoryNickname = getCategoryName(category.category),
//            cat;
//        if (newDescriptor.categories[categoryNickname]) {
//            // category already exists -- does it have same widgetClass?
//            cat = newDescriptor.categories[categoryNickname];
//            if (category.widgetClass !== cat.widgetClass) {
//                categoryNickname += "-" + category.widgetClass.toLowerCase();
//                cat = newDescriptor.categories[categoryNickname] = {};
//            }
//        } else {
//            cat = newDescriptor.categories[categoryNickname] = {};
//        }
       
//        cat.name = category.category;
//        delete category.category;
//        if (category.description) {
//            cat.description = category.description;
//            delete category.description;
//        }
//        if (category.widgetClass) {
//            cat.widgetClass = category.widgetClass;
//            delete category.widgetClass;
//        }
//        for (var p in category) if (category.hasOwnProperty(p)) {
//            if (p !== "items") {
//                util.debug("ERROR: unhandled category property: " + p);
//            }
//        }
       
//        category.items.forEach(function(item) {
//            var newItem = {};
//            if (item.name) {
//                newItem.name = item.name;
//                delete item.name;
//            }
//            if (item.description) {
//                newItem.description = item.description;
//                delete item.description;
//            }
//            if (item.type) {
//                newItem.type = item.type;
//                delete item.type;
//            }
//            newItem.category = categoryNickname;
//            for (var q in item) if (item.hasOwnProperty(q)) {
//                newItem[q] = item[q];
//            }
//            newDescriptor.widgets.push(newItem);
//        });
//    });
   
//    // write out new widgets.json
//    fs.writeFile(descriptorPath, JSON.stringify(newDescriptor, null, "    "), "utf8", function(err) {
//        if (err) throw err;
//    });
//    // util.log(JSON.stringify(newDescriptor, null, "    "));
// }

// function getCategoryName(name) {
//    switch (name.toLowerCase()) {
//        case "dojo containers":
//            return "containers";
//        case "dojo controls":
//            return "controls";
//        case "untested dojo&html":
//            return "untested";
//        case "html":
//        case "jquery ui":
//        case "yui":
//            return name.toLowerCase().replace(/\s/g, "-");
//        case "lotus oneui":
//            return "oneui";
//    }
//    util.debug("ERROR: unhandled category name: " + name.toLowerCase());
//    return name.toLowerCase();
// }





//function parseMetadataDir(dir) {
//    // read in Dojo descriptor file
//    var descriptorPath = path.join(dir, "widgets.json");
//    var data = fs.readFileSync(descriptorPath, "utf8");
//    descriptor = jsonParse(data, descriptorPath);
//    
//    // read in widget metadata files
//    enumerateDirSync(dir,
//        /.*_oam.json$/,
//        function onFile(filepath) {
//            var data = fs.readFileSync(filepath, "utf8");
//            handleMetadataFile(filepath, data);
//        },
//        function onEnd() {
//            // write out new widgets.json
//            fs.writeFile(descriptorPath, JSON.stringify(descriptor, null, "    "), "utf8", function(err) {
//                if (err) throw err;
//            });
//            
//            // write out new metadata files for each widget
//            for (var metadataPath in metadataFiles) if (metadataFiles.hasOwnProperty(metadataPath)) {
//                var md = metadataFiles[metadataPath];
//
//                // create new object, with specific properties order
//                var order = [
//                    "id",
//                    "name",
//                    "spec",
//                    "version",
//                    "sandbox",
//                    "require",
//                    "library",
//                    "property",
//                    "childProperties",
//                    "content",
//                    "javascript"
//                ];
//                var newMd = {};
//                order.forEach(function(prop) {
//                    if (md[prop]) {
//                        newMd[prop] = md[prop];
//                    }
//                    delete md[prop];
//                });
//                
//                // don't care about "xmlns" in JSON file
//                delete md.xmlns;
//                
//                // check if any props still left in old metadata object
//                for (var p in md)  if (md.hasOwnProperty(p)) {
//                    debug("ERROR: unhandled property: " + p, metadataPath);
//                }
//                
//                fs.writeFile(metadataPath, JSON.stringify(newMd, null, "    "), "utf8", function(err) {
//                    if (err) throw err;
//                });
//            };
//        }
//    );
//}
//
//function handleMetadataFile(filepath, data) {
//    if (path.basename(filepath).charAt(0) === "_") {
//        debug("WARNING: this metadata file should be removed", filepath);
//    }
//    
//    // store object
//    var md = metadataFiles[filepath] = jsonParse(data, filepath);
//    
//    if (md.property) {
//        var descriptorItem = getDescriptorItem(md.name);
//        for (var name in md.property) if (md.property.hasOwnProperty(name)) {
//            var prop = md.property[name];
//            if (name.indexOf("davinci:") === 0) {
//                if (!descriptorItem) {
//                    util.debug("No descriptor item for " + md.name + ", but did find " + name);
//                } else {
//                    // add davinc-specific metadata to descriptor item
//                    var newName = name.slice(8);
//                    newName = newName === "inLineEdit" ? "inlineEdit" : newName;
//                    switch (prop.datatype) {
//                        case "string":
//                        case "boolean":
//                            descriptorItem[newName] = prop.defaultValue;
//                            break;
//                        case "object":
//                            descriptorItem[newName] = prop.defaultValue;
//                            break;
//                        default:
//                            util.debug("Unhandled prop '" + name + "' for '" + md.name + "'");
//                    }
//                }
//                
//                // remove "davinci" property from widget's metadata
//                delete md.property[name];
//                
//                // if "property" is empty object, delete that too
//                var count = 0;
//                for (var i in md.property) if (md.property.hasOwnProperty(i)) {
//                    count++;
//                    break;
//                }
//                if (count == 0) {
//                    delete md.property;
//                }
//            }
//        };
//    }
//}
//
//function getDescriptorItem(widgetType) {
//    var found = null;
//    descriptor.some(function(category, index, array) {
//        return category.items.some(function(item, index, array) {
//            if (item.type == widgetType) {
//                found = item;
//                return true;
//            }
//            return false;
//        });
//    });
//    return found;
//}





// function handleMetadataFile(filepath, data) {
//     // store object
//     var md = metadataFiles[filepath] = jsonParse(data, filepath);
//     
//     // // does this metadata file have a helper class?
//     // if (md.property && md.property["davinci:helper"]) {
//     //     handleHelperClass(filepath);
//     // }
//     
//     if (md.require) {
//         md.require.forEach(function(elem, index, array){
//             if (elem.src && elem.$library) {
//                 var part = md.library[elem.$library].src.match(/.*\/([^\/]+)\/?$/)[1];
//                 elem.src = path.join(part, elem.src);
//             }
//         });
//     }
//     if (md.library) {
//         for (var elem in md.library) if (md.library.hasOwnProperty(elem)) {
//             md.library[elem].src = md.library[elem].src.match(/(.*\/)[^\/]+\/?$/)[1];
//         }
//     }
//     
//     updateMetadataFile(filepath);
// }
// 
// function updateMetadataFile(filepath) {
//     fs.writeFile(filepath, JSON.stringify(metadataFiles[filepath], null, "    "), "utf8", function(err) {
//         if (err) throw err;
//     });
// }





// var _helpers = {
//     "ContentPaneHelper": "dijit/layout/ContentPaneHelper.js",
//     "SortListHelper": "dojox/widget/SortListHelper.js",
//     "DataPropertyHelper": "dojox/grid/DataPropertyHelper.js"
// };
// 
// function handleHelperClass(metadataFile) {
//     var helper = metadataFiles[metadataFile].property["davinci:helper"].defaultValue;
//     
//     if (/davinci.metadata.dojo.*/.test(helper)) {
//         return;
//     }
//     
//     var helperShortPath = helper.split(".").slice(1).join("/") + ".js";
//     var helperPath = path.join(process.argv[2], helperShortPath);
//     
//     path.exists(helperPath, function(exists) {
//         if (!exists) {
//             var h = path.basename(helperPath, ".js");
//             if (h in _helpers) {
//                 helperShortPath = _helpers[h];
//                 helperPath = path.join(process.argv[2], helperShortPath);
//             } else {
//                 util.debug("helper path does not exist: " + helperPath);
//             }
//         }
//         updateHelperInMetadata(metadataFile, helperShortPath);
//     });
// }
// 
// function updateHelperInMetadata(metadataFile, helperShortPath) {
//     var helperClass = "davinci.metadata.dojo." + helperShortPath.match(/(.*)\.[a-zA-Z]+$/)[1].replace(/\//g, ".");
//     metadataFiles[metadataFile].property["davinci:helper"].defaultValue = helperClass;
//     
//     fs.writeFile(metadataFile, JSON.stringify(metadataFiles[metadataFile], null, "    "), "utf8", function(err) {
//         if (err) throw err;
//     });
// }





// function handleHelperClass(metadataFile) {
//     var helper = metadataFiles[metadataFile].property["davinci:helper"].defaultValue;
//     
//     var helperPath = path.join(process.argv[2],
//             helper.match(/davinci.metadata.dojo\.(.*)/)[1].replace(/\./g, "/")) + ".js";
//     
//     fs.readFile(helperPath, "utf8", function(err, data) {
//         if (err) throw err;
//         if (data.indexOf("dojo.provide") !== -1) {
//             
//         } else {
//             var m = data.match(/^\s*\[?\s*(\{\s*[\s\S]*\s*\})\s*\]?\s*$/);
//             if (m.length != 2) {
//                 debug("helper class content match failed", helperPath);
//             }
//         }
//     });
// }
// 
// var _helperClassTemplate = [
//     'dojo.provide("${helperClass}");\n',
//     '\n',
//     'dojo.declare("${helperClass}", null, ${helperMixin});'
// ].join('');
// 
// function generateHelperClassFile(path, className, text, obj) {
//     if (Array.isArray(obj)) {
//         obj = obj[0];
//     }
//     
//     var newFileContent = _helperClassTemplate.replace(/\$\{helperClass\}/g, className)
//             .replace("${helperMixin}", JSON.stringify(obj, null, "    "));
// util.debug("new file content = " + newFileContent);
// util.debug("obj jsonified = " + JSON.stringify(obj, null, "    "));
// }
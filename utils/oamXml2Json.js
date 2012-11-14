#!/usr/bin/env node

/**
 * This requires the sax-js and jsDom packages to Node. Install with following
 * commands, in same directory as script:
 *      npm install sax@0.2.3
 *      npm install jsdom@0.2.3
 * ----------------------------------------------------------------
 * SUPPLEMENTAL NOTES 20121114 JF:
 *  Had to install Node.js (which was simple)
 *  Then I couldn't get jsdom@0.2.3 to install successfully in local ./node-modules.
 *  Instead, I installed latest versions (sax, jsdom) and manually installed node-gyp
 *  before jsdom (although not sure this was necessary), and could only get things working
 *  by installing everything globally (-g) via sudo. Still got a warning message
 *  on installing jsdom about optional module contextify not installing correctly,
 *  but contextify doesn't seem to be necessary for this app.
 *  So that Node finds the globally installed modules, had to edit ~/.profile to add this line 
 *    export NODE_PATH="/usr/local/lib/node_modules"
 *  Then I successfully converted XML to JSON via:
 *    node oamXml2Json.js sampleOamXml/Heading_oam.xml
 */

var fs = require('fs'),
    sys = require('sys'),
    path = require('path'),
    sax = require('sax'),
    jsdom = require('jsdom');


if ( process.argv.length < 3 ) {
    printHelp();
}

fs.stat( process.argv[2], function( err, stats ) {
    if ( err ) throw err;
    if ( stats.isFile() ) {
        fs.readFile( process.argv[2], "utf8", function( err, data ) {
            if (err) throw err;
            convert( process.argv[2], data );
        });
    } else {
        sys.debug( "ERROR: not a valid file: " + process.argv[2] );
        printHelp();
    }
});

function printHelp() {
    sys.puts( "Usage: node oamXml2Json.js scriptFile" );
    process.exit(1);
}

function convert(filepath, filedata) {
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
            // success -- now convert DOM to JSON
            var json = convertToJson(doc);
//            sys.puts(JSON.stringify(json, null, "    "));
            writeFile(filepath, json);
        } else {
            sys.debug('[' + filepath + '] : \n       Conversion error: unexpected number of total elements');
        }
    };

    parser.write(filedata).close();
//    sys.puts(sys.inspect(doc, true, null));
}

_metadata_plurals = {
    authors: "author",
    categories: "category",
    configs: "config",
    contents: "content",
    enums: "enum",
    examples: "example",
    icons: "icon",
    javascripts: "javascript",
    libraries: "library",
    options: "option",
    properties: "property",
    references: "reference",
    requires: "require",
    topics: "topic"
};

function convertToJson( dom, url ) {
    // Return the attributes of the given DOM element as an object of
    // name-value pairs.
    function _getAttrs(elem) {
        var map = {}, domAttrs = elem.attributes;
        for(var i = 0; i < domAttrs.length; i++) {
            map[domAttrs.item(i).name] = domAttrs.item(i).value;
        }
        return map;
    }

    // Return the text content of the given DOM element.
    function _innerText( node ) {
        var text = node.innerText || node.textContent;
        if ( typeof text === "undefined" ) {
            text = "";
            var children = node.childNodes;
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

    function _count( obj ) {
        var n = 0;
        for ( var p in obj ) {
            n += Object.prototype.hasOwnProperty.call( obj, p );
        }
        return n;
    }
    
    // Parse the given DOM element's children and add data to the "parentObj"
    // object. 
    function _parseElement( metadata, element, parentObj, grandparentObj ) {
        if ( element.childNodes.length === 0 ) {
            return true; // return true in order to circumvent _innerText() call
        }
        
        var elemName = element.tagName.toLowerCase();
        var hasNonTextContent = false;
        
        for ( var i = 0; i < element.childNodes.length; i++ ) {
            var node = element.childNodes.item( i );
            
            // for text nodes, "node.tagName" is undefined
            if ( ! node.tagName ) {
                continue;
            }
            var tagName = node.tagName.toLowerCase();
            
            if ( tagName in _metadata_plurals ) {
                // Ignore plural elements, but loop over their child nodes.
                _parseElement( metadata, node, parentObj, parentObj );
            } else {
                // If the parent of this element is a plural element, then we
                // only want to deal with the singular version of that parent,
                // and ignore all other elements.  For example, for the parent
                // <properties>, we only want to handle any child <property>
                // elements, while ignoring others such as <description>.
                // The only exception is the <library> element, which can be a
                // child of <requires>.
                if ( (elemName in _metadata_plurals) &&
                        tagName !== _metadata_plurals[ elemName ] &&
                        tagName !== "library" )
                {
                    continue;
                }
                
                // <locale> and <property> have already been handled
//                if ( tagName === "locale" || tagName === "property" ) {
//                    continue;
//                }
                
                hasNonTextContent = true;

                // get the attributes for this element
                var item = _getAttrs( node );
                
                // handle any special cases
                var attrs,
                    obj = parentObj;
                switch ( tagName ) {
                    case "locale":
                        var lang = item.lang ? item.lang.toLowerCase() : null;
                        if ( ! lang ) {
                            // If <locale> has no "lang" attribute, then this is the
                            // fallback message bundle.  We only allow one, so just
                            // take the first one.
                            if ( metadata.locale && metadata.locale.DEFAULT ) {
                                contineu;
                            }
                            item.name = "DEFAULT";
                        } else {
                            item.name = lang;
                            delete item.lang;
                        }
                        break;
                    case "option":
                        // If <option> is a child of <options>, save the
                        // 'multiple' and 'unconstrained' attributes if they
                        // exist on the parent.
                        if ( elemName === "options" ) {
                            attrs = _getAttrs( node.parentNode );
                            if ( attrs.multiple ) {
                                item.$parent_multiple = attrs.multiple;
                            }
                            if ( attrs.unconstrained ) {
                                item.$parent_unconstrained = attrs.unconstrained;
                            }
                        }
                        break;
                    case "property":
                        // If <property> is a child of <properties>, save the
                        // 'name' and 'managed' attributes if they exist on
                        // the parent.
                        if ( elemName === "properties" ) {
                            var attrs = _getAttrs( node.parentNode );
                            if ( attrs.name ) {
                                item.$parent_name = attrs.name;
                            }
                            if ( attrs.managed ) {
                                item.$parent_managed = attrs.managed;
                            }
                        }
                        break;
                    case "require":
                        // If a <require> element is a child of a <library>
                        // element, then we save the name of the library to
                        // which that require belongs.
                        if ( elemName === "library" ) {
                            obj = grandparentObj;
                            item.$library = _getAttrs( node.parentNode ).name;
                        }
                        break;
                }

                // See if this element has any child nodes that need to be
                // handled.  If not, then see if it has any text content.
                if ( ! _parseElement( metadata, node, item, parentObj ) ) {
                    var text = null;
//                    if ( item.locid && metadata._locale_ ) {
//                        text = metadata._locale_.messages[ item.locid ];
//                    }
                    if ( ! text ) {
                        text = _innerText( node );
                    }

                    if ( text ) {
//                       item.$text = _doValueSubstitutions( text, metadata, args.properties );
                        item.$text = text;
                    }
                }
                
                // Add this element info to the object.  If this element has a
                // 'name' attribute, then we index using that.
                var name = item.name;
                if ( name ) {
                    if ( ! obj[ tagName ] ) {
                        obj[ tagName ] = {};
                    }
                    delete item.name;
                    obj[ tagName ][ name ] = item;
                } else {
                    // Some elements (such as <content>, <description>) may only have a single text
                    // node child and no attributes.  In this case, we simplify the object by
                    // setting the property value directly to the text node value, instead of 
                    // creating an array with a single element.
                    if ( ! obj[ tagName ] && item.$text && _count( item ) == 1 ) {
                        obj[ tagName ] = item.$text;
                    } else {
                        // Here we have a property that was previously created by the code above.
                        // But it turns out there are multiple elements in the metadata with this
                        // tag name.  So we just create an array of the previous element and this
                        // one.
                        if ( obj[ tagName ] && typeof obj[ tagName ] === "string" ) {
                            var newItem = {
                                $text: obj[ tagName ]
                            };
                            obj[ tagName ] = [ newItem, item ];
                        // For all other elements, just append to an array.
                        } else {
                            if ( ! obj[ tagName ] ) {
                                obj[ tagName ] = [];
                            }
                            obj[ tagName ].push( item );
                        }
                    }
                }
            }
        }
        
        return hasNonTextContent;
    };

    var widget = dom.getElementsByTagName('widget').item(0);
    var metadata = _getAttrs(widget);
    
    // save location of widget metadata file
    if (url) {
        metadata.$src = url;
    }
    
    // parse the rest of the widget DOM
    _parseElement( metadata, widget, metadata, metadata );
        
    return metadata;
}

function writeFile(filepath, json) {
    var path;
    if (/[^A-Za-z0-9]oam.xml$/.test(filepath)) {
        path = filepath.slice(0, -3) + "json";
    } else {
        path = filepath.slice(0, -4) + "_oam.json";
    }
    fs.writeFile(path, JSON.stringify(json, null, "    "), "utf8", function(err) {
        if (err) throw err;
    });
}

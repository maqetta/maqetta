// XXX This object shouldn't have a dependency on SmartInput
define([
    "davinci/ve/input/SmartInput",
    "davinci/util",
    "davinci/library"
], function(SmartInput, util, library) {

	var metadata,
    	METADATA_CLASS_BASE = "davinci.libraries.",
    
    // Array of library descriptors.
    	libraries = {},
    // Widget metadata cache
    // XXX Should there be a limit on metadata objects in memory?
    	cache = {},
    // Localization strings
    	l10n = null,

    	defaultProperties = {
	        id: {datatype: "string", hidden: true},
	        lang: {datatype: "string", hidden: true},
	        dir: {datatype: "string", hidden: true},
	        "class": {datatype: "string", hidden: true},
	        style: {datatype: "string", hidden: true},
	        title: {datatype: "string", hidden: true}
    	};

    dojo.subscribe("/davinci/ui/libraryChanged", function() {
        // XXX We should be smart about this and only reload data for libraries whose path has
        //  changed.  This code currently nukes everything, reloading all libs, even those that
        //  haven't changed.
        libraries = {};
        cache = {};
        l10n = null;
        metadata.init();
    });
    
    function getLibraryMetadata(id, version) {
        var path = library.getMetaRoot(id, version);
        if (! path) {
            return null;
        }

        var result = null;
        dojo.xhrGet({
            url : path + "/widgets.json",
            sync : true, // XXX should be async
            handleAs : "json",
            load : function(data) {
                result = {
                    descriptor : data,
                    metaPath : path
                };
            }
            // XXX handle error is 'widgets.json' does not exist at 'path'
        });

        return result;
        // return (davinci.Runtime.serverJSONRequest({url:"./cmd/getLibMetadata", handleAs:"json", content:{'id': id, 'version':version},sync:true }));
    }

    function parseLibraryDescriptor(data) {
    	
    	var path = new davinci.model.Path(data.metaPath),
    		descriptor = data.descriptor;
     
        descriptor.$path = path.toString();
        
        
        if(libraries.hasOwnProperty(descriptor.name)){
        	  dojo.forEach(descriptor.widgets, function(item) {
                  libraries[descriptor.name].widgets.push(item);
              });
        	  for(var name in descriptor.categories) {
                  if(!libraries[descriptor.name].categories.hasOwnProperty(name)){
                	  libraries[descriptor.name].categories[name] = descriptor.categories[name];
                  }
              };
        	  
        }else{
        
        	libraries[descriptor.name] = descriptor;
    	}
    
        if (descriptor.callbacks) {
            dojo.xhrGet({
                url: path.append(descriptor.callbacks).toString(),
                sync: true, // XXX should be async
                handleAs: 'javascript',
                load: function(data) {
                    descriptor.callbacks = data;
                }
            });
        }
        
        if(descriptor.$providedTypes==null)
        	descriptor.$providedTypes= {};
        
        dojo.forEach(descriptor.widgets, function(item) {
        	
        	 if(libraries.hasOwnProperty(descriptor.name)){
        		 libraries[descriptor.name].$providedTypes[item.type] = item;
        	 }else{
        		 descriptor.$providedTypes[item.type] = item;
        	 }
            // XXX refactor into function, so we don't change original data?
            
        	 
        	 if (item.icon && !item.iconLocal) {
                item.icon = path.append(item.icon).toString();
            }
            // XXX refactor into function
            item.widgetClass = descriptor.categories[item.category].widgetClass;
            
           
            if(libraries.hasOwnProperty(descriptor.name)){
            
            	dojo.forEach(item.data, function(data) {
	                if (!libraries[descriptor.name].$providedTypes[data.type]) {
	                	libraries[descriptor.name].$providedTypes[data.type] = true;
	                }
	            });
            	
            }else{
	            dojo.forEach(item.data, function(data) {
	                if (!descriptor.$providedTypes[data.type]) {
	                    descriptor.$providedTypes[data.type] = true;
	                }
	            });
            }
        });
        
        // mix in descriptor instance functions
        dojo.mixin(descriptor, {
            /**
             * Get a translated string for this library
             * @param key
             * @returns {String}
             */
            _maqGetString: getDescriptorString
        });
        
        // register Dojo module for metadata path; necessary for loading of helper
        // and creation tool classes
        dojo.registerModulePath(METADATA_CLASS_BASE + descriptor.name,
                path.relativeTo(dojo.baseUrl).toString());
    }
    
    function getLibraryForType(type) {
        if (type) {
            for (var name in libraries) if (libraries.hasOwnProperty(name)) {
                var lib = libraries[name];
                if (lib.$providedTypes[type]) {
                    return lib;
                }
            }
        }
        return null;
    }

    var XXXwarned = false;
    function getDescriptorString(key) {
        // XXX What to do about localization? (see initL10n)
        if (!XXXwarned) {
//            console.warn("WARNING: NOT IMPLEMENTED: localization support for library descriptors");
            XXXwarned = true;
        }
        return null;
        // XXX XXX
        
        if (!key) {
            return null;
        }
        key = key.replace(/\./g, "_");
        value = l10n[key];
        return value;
    }
    
    // XXX What to do about localization (this._loc)?
//    function initL10n() {
//        // Place localized strings for each library in a file at libs/{libName}/nls/{libName}.js
//        dojo["requireLocalization"](this.module + "." + this.base, this.base);
//        try {
//            l10n = dojo.i18n.getLocalization(this.module + "." + this.base, this.base);
//        } catch (ex) {
//            console.error(ex);
//        }
//    };
    
    function getMetadata(type) {
        if (!type) {
            return undefined;
        }
        
        if (cache.hasOwnProperty(type)) {
            return cache[type];
        }
        
        // get path from library descriptor
        var lib = getLibraryForType(type),
            descriptorPath;
        if (lib) {
            descriptorPath = lib.$path;
        }
        if (!descriptorPath) {
            return undefined;
        }
        
        var metadata = null;
        var metadataUrl = [ descriptorPath, "/", type.replace(/\./g, "/"), "_oam.json" ].join('');

        if(!lib.localPath){
	        dojo.xhrGet({
	            url: metadataUrl,
	            handleAs: "json",
	            sync: true, // XXX should be async
	            load: function(data) {
	                metadata = data;
	            }
	        });
        }else{
        	var base = davinci.Runtime.getProject();
        	var resource = system.resource.findResource("./"+ base + "/" + metadataUrl);
        	metadata = dojo.fromJson(resource.getText());
        }
        
        if (!metadata) {
            console.error("ERROR: Could not load metadata for type: " + type);
            return null;
        }
        
        metadata.property = dojo.mixin({}, defaultProperties, metadata.property);
        // store location of this metadata file, since some resources are relative to it
        metadata.$src = metadataUrl;
        // XXX localize(metadata);
        cache[type] = metadata;

        // OAM may be overridden by metadata in widgets.json
        util.mixin(metadata, lib.$providedTypes[type].metadata);
        
        return metadata;
    }
    
//     function localize(metadata) {
//        if (!l10n) {
//            return;
//        }
//        
//        var loc = l10n;
//        if (metadata.name) {
//            var label = loc[metadata.name];
//            if (label) {
//                metadata.label = label;
//            }
//        }
//        var properties = metadata.properties;
//        if (properties) {
//            for ( var name in properties) {
//                var label = loc[name];
//                if (label) {
//                    properties[name].label = label;
//                }
//                var description = loc[name + "_description"];
//                if (description) {
//                    properties[name].description = description;
//                }
//            }
//        }
//        var events = metadata.events;
//        if (events) {
//            for ( var name in events) {
//                var label = loc[name];
//                if (label) {
//                    events[name].label = label;
//                }
//            }
//        }
//        var panes = metadata.propertyPanes;
//        if (panes) {
//            for ( var name in panes) {
//                var label = loc[name];
//                if (label) {
//                    panes[name].label = label;
//                }
//            }
//        }
//    };
    
    function queryProps(obj, queryString) {
        if (!queryString) { // if undefined, null or empty string
            return obj;
        }
        dojo.every(queryString.split("."), function(name) {
            if (!obj[name]) {
                obj = undefined;
                return false;
            }
            obj = obj[name];
            return true;
        });
        return obj;
    }
    
    function getAllowedElement(name, type) {
    	var propName = 'allowed' + name,
    		prop = metadata.queryDescriptor(type, propName);
    	if (! prop) {
    		// set default -- 'ANY' for 'allowedParent' and 'NONE' for
    		// 'allowedChild'
    		prop = name === 'Parent' ? 'ANY' : 'NONE';
    	}
    	return prop.split(/\s*,\s*/);
    }

    
    var metadata = {
        /**
         * Read the library metadata for all the libraries linked in the user's workspace
         */
		init: function() {
			dojo.forEach(library.getInstalledLibs(), function(lib) {
				var data = getLibraryMetadata(lib.id, lib.version);
				if (data) {
					parseLibraryDescriptor(data);
				}
			});
			/* add the users custom widgets to the library metadata */
			var base = davinci.Runtime.getProject();
			var descriptor = library.getCustomWidgets(base);
			//if(descriptor.custom) parseLibraryDescriptor({descriptor:descriptor.custom, metaPath:descriptor.custom.metaPath});
			
		},
        
		/* used to update a library descriptor after the fact */
		parseMetaData: function(data){
			parseLibraryDescriptor(data);
		},
		
        /**
         * Get library metadata.
         * @param {String} [name]
         * 			Library identifier.
         * @returns library metadata if 'name' is defined; otherwise, returns
         * 			array of all libraries' metadata.
         */
        getLibrary: function(name) {
        	return name ? libraries[name] : libraries;
        },
        
    	loadThemeMeta: function(model) {
    		// try to find the theme using path magic
    		var style = model.find({elementType:'HTMLElement', tag:'style'});
    		var imports = [];
    		var claroThemeName="claro";
    		var claroThemeUrl;
    		for(var z=0;z<style.length;z++){
    			for(var i=0;i<style[z].children.length;i++){
    				if(style[z].children[i].elementType== 'CSSImport') {
    					imports.push(style[z].children[i]);
    				}
    			}
    		}
    		
    		var themePath = new davinci.model.Path(model.fileName);
    		/* remove the .theme file, and find themes in the given base location */
    		var allThemes = library.getThemes(themePath.removeLastSegments(1).toString());
    		var themeHash = {};
    		for(var i=0;i<allThemes.length;i++){
    		    if (allThemes[i]['files']){ // #1024 theme maps do not have files
    		    	// This can't be right... making the same assignment k times.  See also Context.js loadThenme ~line 572
        			for(var k=0;k<allThemes[i]['files'].length;k++){
        				themeHash[allThemes[i]['files']] = allThemes[i];
        			}
    		    }
    		}
    		
    		
    		/* check the header file for a themes CSS.  
    		 * 
    		 * TODO: This is a first level check, a good second level check
    		 * would be to grep the body classes for the themes className. this would be a bit safer.
    		 */
    		
    		for(var i=0;i<imports.length;i++){
    			var url = imports[i].url;
    			/* trim off any relative prefix */
    			for(var themeUrl in themeHash){
    				if(themeUrl.indexOf(claroThemeName) > -1){
    					claroThemeUrl = themeUrl;
    				}
    				if(url.indexOf(themeUrl)  > -1){
    					return {
    						themeUrl: url,
    						themeMetaCache: library.getThemeMetadata(themeHash[themeUrl]),
    						theme: themeHash[themeUrl]
    					};
    				}
    			}
    		}
    		
    		// check for single mobile theme's
    		if (ro = metadata._loadThemeMetaDojoxMobile(model, themeHash)){
    		    return ro;
    		}

   		
    		// If we are here, we didn't find a cross-reference match between 
    		// CSS files listed among the @import commands and the themes in
    		// themes/ folder of the user's workspace. So, see if there is an @import
    		// that looks like a theme reference and see if claro/ is in
    		// the list of themes, if so, use claro instead of old theme
    		if(claroThemeUrl){
    			var newThemeName = claroThemeName;
    			var oldThemeName;
    			for(var i=0;i<imports.length;i++){
    				var cssfilenamematch=imports[i].url.match(/\/([^\/]*)\.css$/);
    				if(cssfilenamematch && cssfilenamematch.length==2){
    					var cssfilename = cssfilenamematch[1];
    					var themematch = imports[i].url.match(new RegExp("themes/"+cssfilename+"/"+cssfilename+".css$"));
    					if(themematch){
    						oldThemeName = cssfilename;
    						break;
    					}
    				}
    			}
    			if(oldThemeName){
    				// Update model
    				var htmlElement=model.getDocumentElement();
    				var head=htmlElement.getChildElement("head");
    				var bodyElement=htmlElement.getChildElement("body");
    				var classAttr=bodyElement.getAttribute("class");
    				if (classAttr){
    					bodyElement.setAttribute("class",classAttr.replace(new RegExp("\\b"+oldThemeName+"\\b","g"),newThemeName));
    				}
    				var styleTags=head.getChildElements("style");
    				dojo.forEach(styleTags, function (styleTag){
    					dojo.forEach(styleTag.children,function(styleRule){
    						if (styleRule.elementType=="CSSImport"){
    							styleRule.url = styleRule.url.replace(new RegExp("/"+oldThemeName,"g"),"/"+newThemeName);
    						}
    					}); 
    				});
    				// Update data in returnObject
    				var url = imports[i].url.replace(new RegExp("/"+oldThemeName,"g"),"/"+newThemeName);
    				var returnObject = {
    					themeUrl: url,
    					// Pull claro theme data
    					themeMetaCache: library.getThemeMetadata(themeHash[claroThemeUrl]),
    					theme: themeHash[claroThemeUrl]
    				};
    				returnObject.themeMetaCache.usingSubstituteTheme = {
						oldThemeName:oldThemeName,
						newThemeName:newThemeName
    				};
    				// Make sure source pane updates text from model

    				return returnObject;	
    			}
    		}
    	},
 
// FIXME this bit of code should be moved to toolkit specific ////////////////////////////////////////////////////////////
    	/**
         * Returns the theme meta data if the current theme of the page is dojox.mobile.deviceTheme 
         * 
         * @param model {Object}
         * @param themeHash {Hash}
         * @returns {Object} theme
         */
    	_loadThemeMetaDojoxMobile: function(model, themeHash){
     
             var scriptTags=model.find({elementType:'HTMLElement', tag:'script'}); 
             for(var s=0; s<scriptTags.length; s++){
                 var text=scriptTags[s].getElementText();
                 if (text.length) {
                     // Look for a dojox.mobile.themeMap in the document, if found set the themeMap 
                     var start = text.indexOf('dojox.mobile.themeMap');
                     if (start > 0){
                         start = text.indexOf('=', start);
                         var stop = text.indexOf(';', start);
                         if (stop > start){
                             var themeMap = dojo.fromJson(text.substring(start+1,stop));
                             var url = themeMap[0][2][0];
                             /* trim off any relative prefix */
                             for(var themeUrl in themeHash){
                                 if(url.indexOf(themeUrl)  > -1){
                                     return {
                                    	 themeUrl: url,
                                    	 themeMetaCache: library.getThemeMetadata(themeHash[themeUrl]),
                                    	 theme: themeHash[themeUrl]
                                     };
                                 }
                             }
                         }
                      }
                  }
             }
             return;
    	},
// FIXME end of dojox mobile  ////////////////////////////////////////////////////////////////
    	
    	/**
    	 * Returns the descriptor for the library which contains the given
    	 * widget type
    	 * @param type {string} widget type
    	 * @returns {Object} library JSON descriptor
    	 */
        getLibraryForType: function(type) {
            return getLibraryForType(type);
        },
        
        getLibraryBase: function(type) {
            var lib = getLibraryForType(type);
            if (lib) {
                return lib.$path;
            }
        },

        /**
         * Invoke the callback function, if implemented by the widget library.
         * @param type {string} widget type
         * @param fnName {string} callback function name
         * @param args {?Array} arguments array to pass to callback function
         */
        // XXX make this part of a mixin for the library metadata obj
        invokeCallback: function(type, fnName, args) {
            var lib = getLibraryForType(type),
                fn;
            if (lib && lib.callbacks) {
                fn = lib.callbacks[fnName];
                if (fn) {
                    fn.apply(lib.callbacks, args);
                }
            }
            // XXX handle/report errors?
        },

        /**
         * @param {String|Object} widget
         *            Can be either a string of the widget type (i.e. "dijit.form.Button") or
         *            a davinci.ve._Widget instance.
         * @param queryString
         * @return 'undefined' if there is any error; otherwise, the requested data.
         */
        query: function(widget, queryString) {
            if (!widget) {
                return;
            }
            
            var type,
                metadata;
            if (widget.declaredClass) { // if instance of davinci.ve._Widget
                if (widget.metadata) {
                    metadata = widget.metadata;
                }
                type = widget.type;
            } else {
                type = widget;
            }
            
            if (!metadata) {
                metadata = getMetadata(type);
                if (!metadata) {
                    return;
                }
                if (widget.declaredClass) {
                    widget.metadata = metadata;
                }
            }
            
            return queryProps(metadata, queryString);
        },
        
        /**
         * @param {String} type
         *            Widget type (i.e. "dijit.form.Button")
         * @param queryString
         * @return 'undefined' if there is any error; otherwise, the requested data.
         */
        queryDescriptor: function(type, queryString) {
            var lib = getLibraryForType(type),
                item;
            if (lib) {
                item = lib.$providedTypes[type];
            }
            if (!item || typeof item !== "object") {
                return undefined;
            }
            
            var value = queryProps(item, queryString);
            
            // post-process some values
            switch (queryString) {
                case "resizable":
                    // default to "both" if not defined
                    if (!value) {
                        value = "both";
                    }
                    break;
                case "inlineEdit":
                    // instantiate inline edit object
                    if (value) {
                        if (typeof value == "string") {
                            dojo['require'](value);
                            var aClass = dojo.getObject(value);
                            if (aClass) {
                                value = new aClass();
                            }
                        } else {
                            var si = new SmartInput();
                            dojo.mixin(si, value);
                            value = si;
                        }
                    }
                    break;
            }
            return value;
        },
        
        /**
         * Return value of 'allowedParent' property from widget's descriptor.
         * If widget does not define that property, then it defaults to ['ANY'].
         * 
         * @param {String} type
         * 			Widget type (i.e. "dijit.form.Button")
         * @returns Array of allowed widget types or ['ANY']
         * @type {[String]}
         */
        getAllowedParent: function(type) {
        	return getAllowedElement('Parent', type);
        },
        
        /**
         * Return value of 'allowedChild' property from widget's descriptor.
         * If widget does not define that property, then it defaults to ['NONE'].
         * 
         * @param {String} type
         * 			Widget type (i.e. "dijit.form.Button")
         * @returns Array of allowed widget types, ['ANY'] or ['NONE']
         * @type {[String]}
         */
        getAllowedChild: function(type) {
        	return getAllowedElement('Child', type);
        }
    };

    return metadata;
});

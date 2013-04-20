define([
	"require",
	"dojo/Deferred",
    "dojo/promise/all",
    "dojo/_base/lang",
    "dojo/_base/connect",
   // "davinci/Workbench",
	"../library",
	"../model/Path",
	"../repositoryinfo"
], function(require, Deferred, all, lang, connect, Library, Path, info) {

	var Metadata,
		Workbench,
    
    // Array of library descriptors.
    	libraries = {},
    // Widget metadata cache
    // XXX Should there be a limit on metadata objects in memory?
    	mdCache = {},
    // Cache for instantiated helper objects.  See getHelper().
    	helperCache = {},
    // Localization strings
    	l10n = null,
    // Each callbacks.js file gets its own deferred.
    // Ensures page editors don't start processing until all callback.js files are ready
    	deferredGets = [],

        libExtends = {},

    	defaultProperties = {
	        id: {datatype: "string", hidden: true},
	        lang: {datatype: "string", hidden: true},
	        dir: {datatype: "string", hidden: true},
	        "class": {datatype: "string", hidden: true},
	        style: {datatype: "string", hidden: true},
	        title: {datatype: "string", hidden: true}
    	};

    dojo.subscribe("/davinci/ui/libraryChanged/start", function() {
        // XXX We should be smart about this and only reload data for libraries whose path has
        //  changed.  This code currently nukes everything, reloading all libs, even those that
        //  haven't changed.
        libraries = {};
        mdCache = {};
        helperCache = {};
        l10n = null;
        Metadata.init().then(function() {
        	dojo.publish("/davinci/ui/libraryChanged");
        });
    });

    /**
     * Copies/adds all properties of one or more sources to dest; returns dest.
     * Similar to dojo.mixin(), except this function does a deep merge.
     * 
     * @param  {Object} dest
     *          The object to which to copy/add all properties contained in source. If dest is
     *          falsy, then a new object is manufactured before copying/adding properties
     *          begins.
     * @param  {Object} srcs
     *          One of more objects from which to draw all properties to copy into dest. Srcs
     *          are processed left-to-right and if more than one of these objects contain the
     *          same property name, the right-most value "wins".
     * @return {Object}
     *          dest, as modified
     */
    function deepMixin(dest, srcs) {
        dest = dest || {};
        for (var i = 1, l = arguments.length; i < l; i++) {
            var src = arguments[i],
                name,
                val;
            for (name in src) {
                if (src.hasOwnProperty(name)) {
                    val = src[name];
                    if (!(name in dest) || (typeof val !== 'object' && dest[name] !== val)) {
                        dest[name] = val;
                    } else {
                        deepMixin(dest[name], val);
                    }
                }
            }
        }
        return dest;
    }

	function parsePackage(pkg, path) {
		libraries[pkg.name] = pkg;
		path = new Path(path);

		// merge in the 'oam' and 'maqetta' overlays
		var overlays = pkg.overlays;
		for (var name in overlays) {
			if (overlays.hasOwnProperty(name)) {
				if (name === 'oam' || name === 'maqetta') {
					deepMixin(pkg, overlays[name]);
				}
			}
        }
		delete pkg.overlays;

        // Register a module identifier for the metadata and library code paths;
        // used by helper and creation tool classes.
        pkg.__metadataModuleId = 'maq-metadata-' + pkg.name;
        var locPath = new Path(location.href);
        var packages = [ {
            name : pkg.__metadataModuleId,
            location : locPath.append(path).append(pkg.directories.metadata).toString()
        } ];
        if (pkg.name != "dojo") {
            // Don't register another "dojo" lib to compete with core.client. Also, note
            // no longer adding pkg.version to module id because not compatible when
            // we go to custom build the library.
            pkg.__libraryModuleId = pkg.name;
            var libPath = 'app/static/lib/' + pkg.name + '/' + pkg.version;

            packages.push({
                name: pkg.__libraryModuleId,
                location: locPath.append(libPath).toString()
            });
        }
        require = require({
            packages: packages
        });

        // read in Maqetta-specific "scripts"
        var deferred; // dojo/Deferred or value
		if (lang.exists("scripts.widget_metadata", pkg)) {
			if (typeof pkg.scripts.widget_metadata == "string") {
				var widgetsJsonPath = path.append(pkg.scripts.widget_metadata);
				deferred = dojo.xhrGet({
					url : widgetsJsonPath.toString() + "?" + info.revision,
					handleAs : "json"
				}).then(function(data) {
					if (data) {
						var widgetsJsonParentPath = widgetsJsonPath.getParentPath();
						return parseLibraryDescriptor(pkg.name, data,
								widgetsJsonParentPath, widgetsJsonParentPath); // lop off "*.json"
		            }
		        });
			} else {
                // the "widgets.json" data is presented inline in package.json
				deferred = parseLibraryDescriptor(pkg.name, pkg.scripts.widget_metadata, path);
			}
	    }
    
        if (lang.exists("scripts.callbacks", pkg)) {
            var d = new Deferred();
            require([pkg.scripts.callbacks], function(cb) {
                pkg.$callbacks = cb;
                d.resolve();
            });
            deferredGets.push(d);
        }

        return deferred;
    }

	function parseLibraryDescriptor(libName, descriptor, descriptorParentFolderPath, moduleFolderPath) {
		if (!libName) {
			console.error("parseLibraryDescriptor: missing 'libName' arg");
		}

		var pkg = libraries[libName];
		var path = descriptorParentFolderPath;
		// XXX Should remove $descriptorFolderPath. This info is already stored in the packages
		//   structure; just use that. (NOTE: $descriptorFolderPath is also used by custom widgets)
        descriptor.$descriptorFolderPath = path.toString();
        descriptor.$moduleFolderPath = moduleFolderPath.toString();
        
		// Handle custom widgets, which call this function without first calling
		// parsePackage().
		if (!pkg) {
			libraries[libName] = {
				$wm: descriptor,
				name:descriptor.name,
				version:descriptor.version
			};
			// NOTE: Custom widgets include __metadataModuleId on the descriptor
			if(descriptor.__metadataModuleId){
				libraries[libName].__metadataModuleId = descriptor.__metadataModuleId;
			}
			pkg = libraries[libName];
		} else if (pkg.$widgets) {
			descriptor.widgets.forEach(function(item) {
				pkg.$wm.widgets.push(item);
			});
			for (var name in descriptor.categories) {
				if (! pkg.$wm.categories.hasOwnProperty(name)) {
					pkg.$wm.categories[name] = descriptor.categories[name];
				}
			}
		}else if(pkg.$wm){
			/* metadata already exists, mix the new widgets with old */
			for(var z=0;z<descriptor.widgets.length;z++){
				var found = false;
				for(var ll=0;!found && ll<pkg.$wm.widgets.length;ll++){
					if(pkg.$wm.widgets[ll].type==descriptor.widgets[z].type)
						found = true;
				}
				
				if(!found){
					pkg.$wm.widgets.push(descriptor.widgets[z]);
				}
			}
			
		
		} else if(!pkg.$wm) {
			// XXX For now, put data from widgets.json as sub-property of package.json
			//   data.  Later, this should be split up into separate APIs.
			//   
			//   libraries[] = pkg = {
			//       name:
			//       description:
			//       version:
			//       directories: {
			//           lib:
			//           metadata:
			//       }
			//       scripts: {
			//           widget_metadata:  URL
			//       }
			//       $wm: {    // from widgets.json
			//          categories: {}
			//          widgets: []
			//          $providedTypes: {} - assoc attray, each entry points to a widget descriptor
			//          $providedTags: {} - assoc array, each entry points to an array of widget descriptors
			//          $descriptorFolderPath:
			//          $moduleFolderPath:
			//       }
			//       $callbacks:  JS
			//   }
			pkg.$wm = descriptor;
		}

		var wm = pkg.$wm;
		
		function addTag(wm, tag, item){
			if(typeof wm.$providedTags[tag] == 'undefined'){
				wm.$providedTags[tag] = [];
			}
			wm.$providedTags[tag].push(item);
		}
        
		wm.$providedTypes = wm.$providedTypes || {};
		wm.$providedTags = wm.$providedTags || {};

		wm.widgets.forEach(function(item) {
			wm.$providedTypes[item.type] = item;
			// In widgets.json, item.tags can be either a string or an array of strings.
			if(typeof item.tags == 'string'){
				addTag(wm, item.tags, item);
			}else if(item.tags && item.tags.length){
				for(var tagindex=0; tagindex<item.tags.length; tagindex++){
					addTag(wm, item.tags[tagindex], item);
				}
			}
        	if (item.icon && !item.iconLocal) {
                item.icon = path.append(item.icon).toString();
            }
        	if (item.iconLarge && !item.iconLargeLocal) {
                item.iconLarge = path.append(item.iconLarge).toString();
            }
            item.widgetClass = wm.categories[item.category].widgetClass;
        });
        
        // mix in descriptor instance functions
        dojo.mixin(wm, {
            /**
             * Get a translated string for this library
             * @param key
             * @returns {String}
             */
            _maqGetString: getDescriptorString
        });

        // handle "extend"
        if (wm.extend) {
            for (var lib_name in wm.extend) {
                if (wm.extend.hasOwnProperty(lib_name)) {
                    if (libraries[lib_name] && libraries[lib_name].$wm) {
                        handleLibExtends(libraries[lib_name].$wm, [wm.extend[lib_name]]);
                    } else {
                        var ext = libExtends[lib_name] || [];
                        ext.push(wm.extend[lib_name]);
                        libExtends[lib_name] = ext;
                    }
                }
            }
        }
        // is another library extending this library?
        if (libExtends[libName]) {
            handleLibExtends(wm, libExtends[libName]);
        }

        return pkg;
    }

    // Extend a "base" library metadata by doing mixin/concat of values specified
    // by descendant library.
    function handleLibExtends(wm, lib_extends) {
        function concat(val1, val2) {
            if (typeof val1 === 'string') {
                return val1 + ',' + val2;
            }
            if (val1 instanceof Array) {
                return val1.concat(val2);
            }
            console.error('Unhandled type for "concat()"');
        }

        var widgetTypes = wm.$providedTypes;
        lib_extends.forEach(function(ext) {
            for (var type in ext) if (ext.hasOwnProperty(type)) {
                var e = ext[type];
                var w = widgetTypes[type/*.replace(/\./g, "/")*/];
                if (e.mixin) {
                    lang.mixin(w, e.mixin);
                }
                if (e.concat) {
                    for (var prop in e.concat) if (e.concat.hasOwnProperty(prop)) {
                        var val = e.concat[prop];
                        if (w[prop]) {
                            w[prop] = concat(w[prop], val);
                        } else {
                            w[prop] = val;
                        }
                    }
                }
            }
        });
    }
    
    // XXX Changed to return package, rather than widgets.json object
    function getLibraryForType(type) {
        if (type) {
            for (var name in libraries) {
	            if (libraries.hasOwnProperty(name)) {
	                var lib = libraries[name];
	                if (lib.$wm && lib.$wm.$providedTypes[type]) {
	                    return lib;
	                }
	            }
            }
        }
        return null;
    }
    
    function getWidgetDescriptorForType(type){
    	var lib = getLibraryForType(type);
    	if(lib){
    		return lib.$wm.$providedTypes[type];
    	}
    }
    
    function getWidgetsWithTag(tag){
    	var arr = [];
        if (tag) {
            for (var name in libraries) {
	            if (libraries.hasOwnProperty(name)) {
	                var lib = libraries[name];
	                if (lib.$wm && lib.$wm.$providedTags[tag]) {
	                    arr = arr.concat(lib.$wm.$providedTags[tag]);
	                }
	            }
            }
        }
        return arr;
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
        /*
        if (!key) {
            return null;
        }
        key = key.replace(/\./g, "_");
        value = l10n[key];
        return value;
        */
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
        
        if (mdCache.hasOwnProperty(type)) {
            return mdCache[type];
        }
        
        // get path from library descriptor
        var lib = getLibraryForType(type),
            wm,
            descriptorPath;
        if (lib) {
            descriptorPath = lib.$wm.$descriptorFolderPath;
        }
        if (!descriptorPath) {
            return null;
        }
        wm = lib.$wm;
        
        var metadata = null;
        var metadataUrl;

        if (!wm.localPath){
            metadataUrl = [descriptorPath, "/", type.replace(/\./g, "/"), "_oam.json" ].join('');
	        dojo.xhrGet({
	            url: metadataUrl + "?" + info.revision,
	            handleAs: "json",
	            sync: true // XXX should be async
		    }).then(function(data) {
                metadata = data;
	        });
        }else{

			// Remove first token on type because it duplicates the folder name for the module
			var typeWithSlashes = type.replace(/\./g, "/");
			var typeTokens = typeWithSlashes.split('/');
			typeTokens.shift();
			var typeAdjusted = typeTokens.join('/');
			metadataUrl = [wm.$moduleFolderPath, "/", typeAdjusted, "_oam.json" ].join('');
			var resource = system.resource.findResource(metadataUrl);
			var content = resource.getContentSync();
			metadata = dojo.fromJson(content);
        }
        
        if (!metadata) {
            console.error("ERROR: Could not load metadata for type: " + type);
            return null;
        }
        
        metadata.$ownproperty = dojo.mixin({}, metadata.property);
        metadata.property = dojo.mixin({}, defaultProperties, metadata.property);
        // store location of this metadata file, since some resources are relative to it
        metadata.$src = metadataUrl;
        // XXX localize(metadata);
        mdCache[type] = metadata;

        // OAM may be overridden by metadata in widgets.json
        deepMixin(metadata, wm.$providedTypes[type].metadata);
        
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
            if(obj[name] === undefined){
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
    		prop = Metadata.queryDescriptor(type, propName);
    	if (! prop) {
    		// set default -- 'ANY' for 'allowedParent' and 'NONE' for
    		// 'allowedChild'
    		prop = name === 'Parent' ? 'ANY' : 'NONE';
    	}
    	return prop.split(/\s*,\s*/);
    }

    function getHelperId(type, helperType){
        var value = Metadata.queryDescriptor(type, helperType);
        if (!value) {
            return null;
        }

        var lib = getLibraryForType(type);
        return getModuleId(lib, value);
    }
    
    function getModuleId(lib, module) {
    	if (!lib || !module) {
    		return null;
    	}
        var moduleId;
        if (typeof module === 'string' && module.substr(0, 2) === './') {
        	// if path is relative...
            moduleId = new Path(lib.__metadataModuleId).append(module).toString();
        } else {
        	moduleId = module;
        }
        return moduleId;
    }
    
	Metadata = {
        /**
         * Read the library metadata for all the libraries linked in the user's workspace
         */
		init: function() {
			var deferreds = [];
			// lazy-load Runtime in order to prevent circular dependency
			Workbench = require('../Workbench');

			Library.getUserLibs(Workbench.getProject()).forEach(function(lib) {
// XXX Shouldn't be dealing with 'package.json' here; that belongs in library.js
// (or a combined object).  Putting it here for now, to quickly integrate.
				var path = lib.metaRoot;
				if (path) {
					// use cache-busting to assure that any development changes
					// get picked up between library releases
					deferreds.push(dojo.xhrGet({
// XXX For now, 'package.json' lives inside the 'metadata' dir.  Will need to
// move it up to the top level of library.
						url : path + "/package.json" + "?" + info.revision,
						handleAs : "json"
					}).then(function(data) {
                        // return deferred
						return parsePackage(data, path);
					}));
				}
			});


			// add the users custom widgets to the library metadata
			
			//if(descriptor.custom.length > 0 ) parseLibraryDescriptor(descriptor.custom.name, descriptor.custom, descriptor.custom.metaPath);

			return all(deferreds);
		},
        
		// used to update a library descriptor after the fact
		parseMetaData: function(name, descriptor, descriptorFolderPath, moduleFolderPath){
		
			return parseLibraryDescriptor(name, descriptor, descriptorFolderPath, moduleFolderPath);
		},
		
        /**
         * Get library metadata.
         * @param {String} [name]
         * 			Library identifier.
         * @returns library metadata if 'name' is defined; otherwise, returns
         * 			array of all libraries' metadata.
         */
// XXX Note: this return package info now.
        getLibrary: function(name) {
        	return name ? libraries[name] : libraries;
        },
        
        getLibraryActions: function(actionSetId, targetID) {
            var actions = [];
            for (var name in libraries) {
                if (libraries.hasOwnProperty(name)) {
                    var lib = libraries[name];
                    var wm = lib.$wm;
                    if (!wm) {
                        continue;
                    }
                    var libActionSets = lib.$wm["davinci.actionSets"];
                    if (!libActionSets) {
                        continue;
                    }
                    dojo.forEach(libActionSets, function(libActionSet) {
                        if (libActionSet.id == actionSetId) {
                        	if (!targetID || (libActionSet.targetID === targetID)) {
	                           var clonedActions = dojo.clone(libActionSet.actions);
	                           dojo.forEach(clonedActions, function(action) {
	                               // May need to transform the action class string to 
	                               // account for the library's name space
	                               if(action.action){
	                                   var newActionModuleId = getModuleId(lib, action.action);
	                                   action.action = newActionModuleId;
	                               }
	                               if(action.menu){
	                                   action.menu.forEach(function(item){
	                                       if(item.action){
	                                           var newActionModuleId = getModuleId(lib, item.action);
	                                           item.action = newActionModuleId;
	                                       }
	                                   });
	                               }
	                               actions.push(action);
	                           });
                        	}
                        }
                    });
                }
            }
            return actions;
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
    		
			var themePath = new Path(model.fileName);
    		/* remove the .theme file, and find themes in the given base location */
    		var allThemes = Library.getThemes(Workbench.getProject());
    		var themeHash = {};
    		for(var i=0;i<allThemes.length;i++){
    		    if (allThemes[i].files){ // #1024 theme maps do not have files
        			for(var k=0;k<allThemes[i].files.length;k++){
        				themeHash[allThemes[i].files[k]] = allThemes[i];
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
    						themeMetaCache: Library.getThemeMetadata(themeHash[themeUrl]),
    						theme: themeHash[themeUrl]
    					};
    				}
    			}
    		}
    		
    		// check for single mobile theme's
			var ro = Metadata._loadThemeMetaDojoxMobile(model, themeHash);
			if (ro) {
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
    					themeMetaCache: Library.getThemeMetadata(themeHash[claroThemeUrl]),
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
                     var start = text.indexOf('dojoxMobile.themeMap');
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
                                    	 themeMetaCache: Library.getThemeMetadata(themeHash[themeUrl]),
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
// XXX This now returns the package metadata (which includes widgets metadata at
//    pkg.$wm).  All external callers just want pkg.name -- that should come
//    from a packages API (i.e. getPackage().name).
        getLibraryForType: function(type) {
            return getLibraryForType(type);
        },
        
        getLibraryMetadataForType: function(type) {
            var lib = getLibraryForType(type);
            return lib ? lib.$wm : null;
        },
        
        /**
         * Returns the widget descriptor object corresponding to a given widget type.
         * @param  {String} type 
         * @return {object}
         */       
        getWidgetDescriptorForType: function(type) {
            return getWidgetDescriptorForType(type);
        },
                
        /**
         * Returns a descriptive property (e.g., description or title) out
         * of an OpenAjax Metadata object (JS object for the foo_oam.json file).
         * corresponding to a given widget type.
         * @param  {String} type  widget type (e.g., 'dijit.form.Button')
         * @param  {String} propName  property name (e.g., 'description')
         * @return {null|object} null if property doesn't exist, otherwise an object with two properties:
         *    type: either 'text/plain' or 'text/html'
         *    value: the value of the property
         */       
        getOamDescriptivePropertyForType: function(type, propName) {
            var oam = getMetadata(type);
            if(oam && oam[propName]){
            	var propValue = oam[propName];
            	if(typeof(propValue) == 'string'){
            		return { type:'text/plain', value:propValue};
            	}else if(typeof propValue.value == 'string'){
            		return { type:(propValue.type ? propValue.type : 'text/plain'), value:propValue.value };
            	}else{
            		return null;
            	}
            }else{
            	return null
            }
        },

        /**
         * Returns an array of widget descriptors for all widgets
         * whose 'tags' property includes the given tag
         * @param  {String} tag 
         * @return {Array(object)}
         */       
        getWidgetsWithTag: function(tag) {
            return getWidgetsWithTag(tag);
        },
        
        getLibraryBase: function(type) {
            var lib = getLibraryForType(type);
            if (lib) {
                return lib.$wm.$descriptorFolderPath;
            }
        },

        /**
         * Invoke the callback function, if implemented by the widget library.
         * @param libOrType {object|string} widget library object or widget type
         * @param fnName {string} callback function name
         * @param args {?Array} arguments array to pass to callback function
         */
        // XXX make this part of a mixin for the library metadata obj
        invokeCallback: function(libOrType, fnName, args) {
            var library = libOrType,
                fn;
            if (typeof libOrType === 'string') {
                library = getLibraryForType(type);
            }
            if (library && library.$callbacks) {
                fn = library.$callbacks[fnName];
                if (fn) {
                    return fn.apply(library.$callbacks, args);
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
         * queryDescriptorByName queries by widget metadata info using 
         * the 'name' value, such as "Button". 
         * The 'type' must be provided too (e.g., 'dijit.form.Button')
         * to make sure we find the right library for the given widget name.
         * 
         * @param {String} name
         * @param {String} type
         *            Widget type (i.e. "dijit.form.Button")
         * @param queryString
         * @return 'undefined' if there is any error; otherwise, the requested data.
         */
        queryDescriptorByName: function(name, type, queryString) {
            var lib = getLibraryForType(type),
                item;
            if (lib) {
            	var widgets = lib.$wm.widgets;
            	for(var i=0; i<widgets.length; i++){
            		if(widgets[i].name == name){
            			item = widgets[i];
            			break;
            		}
            	}
            }
            return this._queryDescriptor(item, queryString);
        },
        
        /**
         * queryDescriptor queries by widget metadata info by 
         * the 'type' value, such as dijit.form.Button
         * 
         * @param {String} type
         *            Widget type (i.e. "dijit.form.Button")
         * @param queryString
         * @return 'undefined' if there is any error; otherwise, the requested data.
         */
        queryDescriptor: function(type, queryString) {
            var lib = getLibraryForType(type),
                item;
            if (lib) {
                item = lib.$wm.$providedTypes[type];
            }
            return this._queryDescriptor(item, queryString);
        },
        
        /**
         * @param {Object} item		Descriptor object
         * @param queryString
         * @return 'undefined' if there is any error; otherwise, the requested data.
         */
        _queryDescriptor: function(item, queryString) {
            if (!item || typeof item !== "object") {
                return;
            }
            
            var value = queryProps(item, queryString);
            
            // post-process some values
            if (queryString === 'resizable') {
                // default to "both" if not defined
                if (!value) {
                    value = "both";
                }
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
        },

        /**
         * Returns the object instance or module ID of the given "helper" type.
         * Only works with:
         *     'helper'
         *     'tool'
         *     'inlineEdit'
         * 
         * Note: return values are cached.
         *
         * @param  {String} type
         *             Widget type (i.e. "dijit/form/Button")
         * @param  {String} helperType
         *             One of the accepted 'helper' types (see description)
         * @return {Deferred}
         */
        getHelper: function(type, helperType) {
        	var d = new Deferred(),
        		idx = type + ':' + helperType;

        	if (idx in helperCache) {
        		d.resolve(helperCache[idx]);
        		return d;
        	}

            var moduleId = getHelperId(type, helperType);
            if (!moduleId) {
            	d.resolve();
            } else {
	            require([moduleId], function(module) {
	                d.resolve(module);
	                helperCache[idx] = module;
	            });
            }

            return d;
        },

        /**
         * Returns the SmartInput instance for the given `type`.
         * @param  {String} type Widget type (i.e. "dijit.form.Button")
         * @return {Object}
         */
        getSmartInput: function(type) {
        	var d = new Deferred();
        	if (type in smartInputCache) {
        		d.resolve(smartInputCache[type]);
        	} else {
	        	var moduleId = getHelperId(type, 'inlineEdit');
	        	if (!moduleId) {
	        		d.resolve(null);
	        	}else if (typeof moduleId === 'string') {
	        		require([moduleId], function(Module) {
	        			d.resolve(smartInputCache[type] = new Module());
	        		});
	        	} else if (Object.prototype.toString.call( moduleId.property ) === '[object Array]') {
	        		// `moduleId` is an object
	        		require(["davinci/ve/input/MultiFieldSmartInput"], function(MultiFieldSmartInput) {
	        			var si = new MultiFieldSmartInput();
	            		lang.mixin(si, moduleId);
	        			d.resolve(smartInputCache[type] = si);
	        		});
	        	} else {
	        		// `moduleId` is an object
	        		require(["davinci/ve/input/SmartInput"], function(SmartInput) {
	        			var si = new SmartInput();
	            		lang.mixin(si, moduleId);
	        			d.resolve(smartInputCache[type] = si);
	        		});
	        	}
        	}

        	return d;
        },
        
        /**
         * Returns any deferred objects that need to be completed before
         * a visual editor should begin processing.
         */
        getDeferreds: function(){
        	return deferredGets;
        }
    };

	var smartInputCache = {};

	connect.subscribe("/davinci/ui/libraryChanged/start", function() {
		// XXX We should be smart about this and only reload data for libraries whose path has
		//  changed.  This code currently nukes everything, reloading all libs, even those that
		//  haven't changed.
		smartInputCache = {};
	});

return dojo.setObject('davinci.ve.metadata', Metadata);

});

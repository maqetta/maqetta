dojo.provide("davinci.ve.metadata");

dojo.require("dojo.i18n");
dojo.require("davinci.ve.input.SmartInput");


/**
 * @static
 */
davinci.ve.metadata = function() {
    
    var METADATA_CLASS_BASE = "davinci.libraries.";
    
    // Array of library descriptors.
    var libraries = {};
    // Widget metadata cache
    // XXX Should there be a limit on metadata objects in memory?
    var cache = {};
    // Localization strings
    var l10n = null;
    
    var defaultProperties = {
        id: {datatype: "string", hidden: true},
        lang: {datatype: "string", hidden: true},
        dir: {datatype: "string", hidden: true},
        "class": {datatype: "string", hidden: true},
        style: {datatype: "string", hidden: true},
        title: {datatype: "string", hidden: true}
    };
    
    // XXX not used anywhere
    // var defaultEvents = [
    // "onkeydown",
    // "onkeypress",
    // "onkeyup",
    // "onclick",
    // "ondblclick",
    // "onmousedown",
    // "onmouseout",
    // "onmouseover",
    // "onmouseup"
    // ];
    
    dojo.subscribe("/davinci/ui/libraryChanged", function() {
        // XXX We should be smart about this and only reload data for libraries whose path has
        //  changed.  This code currently nukes everything, reloading all libs, even those that
        //  haven't changed.
        libraries = {};
        cache = {};
        l10n = null;
        davinci.ve.metadata.init();
    });
    
    function parseLibraryDescriptor(data) {
       var  path = new davinci.model.Path(data.metaPath);
     
        // handle substitutions
       var descriptor  = null;
       
       if(data['data']!=null){
    	   data = data['data'].replace(/__MAQ_LIB_BASE_URL__/g, document.baseURI + path.toString());
       	   descriptor  = dojo.fromJson(data);;
        }else{
        	descriptor = {};
        }
       
        descriptor.$path = path.toString();;
        libraries[descriptor.name] = descriptor;
        
        descriptor.$providedTypes = {};
        dojo.forEach(descriptor.widgets, function(item) {
            descriptor.$providedTypes[item.type] = item;

            // XXX refactor into function, so we don't change original data?
            if (item.icon) {
                item.icon = path.append(item.icon).toString();
            }
            // XXX refactor into function
            item.widgetClass = descriptor.categories[item.category].widgetClass;
            
            dojo.forEach(item.data, function(data) {
                if (!descriptor.$providedTypes[data.type]) {
                    descriptor.$providedTypes[data.type] = true;
                }
            });
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
    
    function getDescriptorForType(type) {
        for (var name in libraries) if (libraries.hasOwnProperty(name)) {
            var lib = libraries[name];
            if (lib.$providedTypes[type]) {
                return lib;
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
        var lib = getDescriptorForType(type),
            descriptorPath;
        if (lib) {
            descriptorPath = lib.$path;
        }
        if (!descriptorPath) {
            return undefined;
        }
        
        var metadata,
            metadataUrl = [ descriptorPath, "/", type.replace(/\./g, "/"), "_oam.json" ].join('');
        dojo.xhrGet({
            url : metadataUrl,
            handleAs : "json",
            sync : true, // XXX should be async
            load : function(data) {
                metadata = data;
            }
        });
        if (!metadata) {
            console.error("ERROR: Could not load metadata for type: " + type);
            return null;
        }
        
        metadata.property = dojo.mixin({}, defaultProperties, metadata.property);
        // store location of this metadata file, since some resources are relative to it
        metadata.$src = metadataUrl;
        // XXX localize(metadata);
        cache[type] = metadata;
        
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

    
    return /** @scope davinci.ve.metadata */ {
        /**
         * Read the library metadata for all the libraries linked in the user's workspace
         */
        init : function() {
        	
            dojo.forEach(davinci.library.getInstalledLibs(), function(lib) {
            	
            //	var path = davinci.library.getMetaRoot(lib.id, lib.version);
             
                var data = davinci.library.getlibMetaData(lib.id, lib.version);
                if(data==null)
                	return;
                parseLibraryDescriptor(data)
                /*
                dojo.xhrGet({
                    url : path + "/widgets.json",
                    sync : true, // XXX should be async
                    load : function(data) {
                        debugger;
                    	parseLibraryDescriptor(data, path);
                    }
                });
                */
            });
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
        
        getLibraryBase : function(type) {
            if (type) {
                var lib = getDescriptorForType(type);
                if (lib) {
                    return lib.$path;
                }
            }
            return undefined;
        },
        
        /**
         * @param {String|Object} widget
         *            Can be either a string of the widget type (i.e. "dijit.form.Button") or
         *            a davinci.ve._Widget instance.
         * @param queryString
         * @return 'undefined' if there is any error; otherwise, the requested data.
         */
        query : function(widget, queryString) {
            if (!widget) {
                return undefined;
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
                    return undefined;
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
        queryDescriptor : function(type, queryString) {
            var lib = getDescriptorForType(type),
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
                            var si = new davinci.ve.input.SmartInput();
                            dojo.mixin(si, value);
                            value = si;
                        }
                    }
                    break;
            }
            return value;
        }
    };
}();

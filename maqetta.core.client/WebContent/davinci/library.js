// XXX This probably shouldn't depend on davinci/ve/metadata.  This object should
//   only concern itself with the notion of a library.  Metadata is handled
//   elsewhere.
define([
    "dojo/_base/xhr",
    "dojo/Deferred",
    "./Runtime",
    "./model/Path",
	"./ve/themeEditor/metadata/CSSThemeProvider",
	"./ve/themeEditor/metadata/query",
	"./workbench/Preferences",
//	"./ve/metadata" // FIXME: circular ref?
],
function(xhr, Deferred, Runtime, Path, CSSThemeProvider, Query/*, Metadata*/, Preferences) {

/*
 * 
 * hard coded libraries for now, should be generated/server based in future.
 * 
 * library name: user readable name
 * library ID: library ID based on lib and version, every library/version should have unique ID.  if non given highest lvl on server assumed.
 * 
 * 
 */

var library={_customWidgets:{}},
	_themesCache = {},
	_themesMetaCache = {},
	_userLibsCache = {},
	_libRootCache = {};

// Cache library roots so we don't make multiple server calls for the same 'id' and 'version'.  But
// clear the cache when any of the libraries change.
dojo.subscribe("/davinci/ui/libraryChanged/start", this, function() {
    _libRootCache = {};
    _userLibsCache = {};
});

/* if resources are deleted, we need to check if they are themes.  if so dump the theme cache so its resynced */
dojo.subscribe("/davinci/resource/resourceChanged",this, function(type, changedResource){
	
	var Workbench = require("davinci/Workbench");
	var base = Workbench.getProject();
	if(type=='deleted' || type=='renamed'){
		// This may seem excessive to delete the  cache on a delete or rename
		// but the user could delete the parent folder which effectivly deletes the .theme file
		// but we are only notified of the Folers deletion so safest to delete the cache.
		var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base);
		var projectThemeBase = new Path(base).append(prefs.themeFolder);
		var resourcePath = new Path(changedResource.getPath());
		if(resourcePath.startsWith(projectThemeBase)){
			delete _themesCache[base];
		}
	}
	
	if (changedResource.elementType == 'File' && changedResource.extension =="theme"){
		// creates we don't do anything with the file is not baked yet
		if (type == 'modified'){
			changedResource.getContent().then(function(content) {
				var t = JSON.parse(content);
				t.path = [changedResource.getPath()];
				t.getFile = function(){
					return system.resource.findResource(this.path[0]);
				}.bind(t);

				for (var i=0; i < _themesCache[base].length; i++){
					if ( _themesCache[base][i].name == t.name) {
						// found theme so replace it
						_themesCache[base][i] = t;
						return;
					}
				}

				// theme not found so add it.
				_themesCache[base].push(t);
			}.bind(this));
		}
	}
});

/* singleton */
library = {

themesChanged: function(base){
	_themesCache[base] = base ? null : [];
},

getThemes: function(base, workspaceOnly, flushCache){
	
	if (flushCache) {
		delete _themesCache[base];
	}
	
	function result(){
		/* filters out workspace/non workspace values  before returning them.  always caches ALL themes */
		var rlt = [];
		if(_themesCache[base]){
			rlt = workspaceOnly ?
				_themesCache[base].filter(function(entry) { return !entry.getFile().isVirtual(); })
				: _themesCache[base];
		}
		return rlt;
	}

	if(_themesCache[base]) {
		return result();
	}

	var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base),
		projectThemeBase = new Path(base).append(prefs.themeFolder);
	
	var allThemes = Runtime.serverJSONRequest({
			url: "cmd/getThemes",
			handleAs: "json",
			content:{
				path: "*.theme",
				ignoreCase: true,
				workspaceOnly: false,
				inFolder: projectThemeBase.toString()
			},
			sync:true
		});

	allThemes.forEach(function(theme){
		theme.getFile = function(){
			return system.resource.findResource(this.path[0]);
		}.bind(theme);
	}.bind(this));
	
	_themesCache[base] = allThemes; 

	return result();
},

getThemeMetadata: function(theme) {
	/* load/find theme metadata files */
	
	if(_themesMetaCache[theme.name]) {
		return _themesMetaCache[theme.name];
	}

	var parent = new Path(theme.getFile().getPath()).removeLastSegments();
	
	var themeCssFiles = theme.files.filter(function(file) {
		return file.indexOf(".css")>-1;
	}).map(parent.append, parent);

	var metaResources = theme.meta.map(function(resource){
		var absoluteLocation = parent.append(resource);
		return system.resource.findResource(absoluteLocation.toString());
	});

	var metadata = new CSSThemeProvider(metaResources, theme);
	_themesMetaCache[theme.name] = {
		loader: new Query(metaResources),
		css: themeCssFiles,
		metadata: metadata
	};
	return _themesMetaCache[theme.name];
},

addCustomWidgets: function(base, customWidgetResource, moduleFolderPath, customWidgetJson) {
	
	var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base);
	if(!prefs.widgetFolder){
		prefs.widgetFolder = "./lib/custom";
		Preferences.savePreferences('davinci.ui.ProjectPrefs', base, prefs);
	}
	
	var descriptorFolderResource = customWidgetResource.getParentFolder();
	var descriptorFolderString = descriptorFolderResource.getPath();
	var descriptorFolderPath = new Path(descriptorFolderString);
	var newJson = require("davinci/ve/metadata").parseMetaData(customWidgetJson.name, customWidgetJson, descriptorFolderPath, moduleFolderPath);
	
	if(!library._customWidgets[base].hasOwnProperty("name")){
		
		library._customWidgets[base].name = 'custom';
		library._customWidgets[base].metaPath = prefs.widgetFolder;
	    library._customWidgets[base].localPath = true;
	}
	library._customWidgets[base] = newJson;	
	dojo.publish("/davinci/ui/addedCustomWidget", [newJson]);
	return newJson;
},

//For developer notes on how custom widgets work in Maqetta, see:
//https://github.com/maqetta/maqetta/wiki/Custom-widgets	

getCustomWidgets: function(base) {
	
	if (! library._customWidgets || ! library._customWidgets[base]){
		// load the custom widgets from the users workspace
		
		if(!library._customWidgets)
			library._customWidgets = {};
		if(!library._customWidgets[base])
			library._customWidgets[base]= [];	
			
		var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		if(!prefs.widgetFolder){
			prefs.widgetFolder = "./lib/custom";
			Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
		}
		
		var widgetFolderSetting = new Path(base).append(prefs.widgetFolder);
		var fullPath = widgetFolderSetting.getSegments();
		var parent = system.resource.findResource(fullPath[0]);
		for(var i=1;i<fullPath.length;i++){
			var folder = parent.getChildSync(fullPath[i]);
			if (folder) {
				parent = folder;
			} else {
				parent = parent.createResource(fullPath[i],true);
			}
		}

		var custom_children;
		parent.getChildrenSync(function onComplete(children){
			custom_children = children;
		}, true);
		this._customWidgetPackages = [];
		var moduleFolderPaths = {};
		for(var i=0; i<custom_children.length; i++){
			var childResource = custom_children[i];
			if(childResource.elementType == "Folder"){
				moduleFolderPaths[childResource.name] = childResource.getPath();
				var maq_name = 'maq-lib-custom-' + childResource.name;
				var url = childResource.getURL();
				require({
					packages: [{name: maq_name, location: url}]
				});
				this._customWidgetPackages.push({name: childResource.name, location: url});
			}
		}
		
		var customWidgets = system.resource.findResource("*_widgets.json", false, parent);
		
		this._customWidgetDescriptors = {};
		for (var i = 0; i < customWidgets.length; i++) {
			var customWidgetResource = customWidgets[i];
			var parentResource = customWidgetResource.getParentFolder();
			var parentUrl = parent.getURL();
			var metadataUrl = parentResource.getURL();
			var metadataUrlRelative = metadataUrl.substr(parentUrl.length+1);
			var metadata = null;
			try{
				//FIXME: Make all of this asynchronous
				//One way to do this would be to consolidate all of the getuserlib calls into a single
				//server call that returns a whole bunch of things at once, and then make that call asynchronous.
				metadata = dojo.fromJson(customWidgetResource.getContentSync());
			}catch(e){
				console.log('Error loading or parsing custom widget metadata file: '+metadataUrlRelative);
			}
			if(!metadata){
				console.warn('No metadata loaded for custom widget: '+metadataUrlRelative);
				continue;
			}
			if(!metadata.customWidgetSpec){
				console.warn('Unsupported older custom widget spec version ('+metadata.customWidgetSpec+') for custom widget: '+metadataUrlRelative);
				continue;
			}
			var customModuleId = metadataUrlRelative.split('/').shift(); // first folder name after "custom"
			metadata.__metadataModuleId = 'maq-lib-custom-' + customModuleId;
			library.addCustomWidgets(base, customWidgetResource, moduleFolderPaths[customModuleId], metadata);
			if(!_libRootCache[base]){
				_libRootCache[base] = {};
			}
			if(!_libRootCache[base][parentResource.name]){
				_libRootCache[base][parentResource.name] = {};
			}
			_libRootCache[base][parentResource.name][metadata.version] = metadataUrl;

			if(metadata && metadata.widgets){
				for(var j=0; j<metadata.widgets.length; j++){
					var widgetType = metadata.widgets[j].type;
					if(widgetType){
						this._customWidgetDescriptors[widgetType] = {
								name: customModuleId,
								location: metadataUrl,
								descriptor: metadata
						};
					}
				}
			}
		}
	}
	
	return {custom: library._customWidgets[base]};
},

getCustomWidgetPackages: function(){
	return this._customWidgetPackages || [];
},

getCustomWidgetDescriptors: function(){
	return this._customWidgetDescriptors ? this._customWidgetDescriptors : {};
},

getInstalledLibs: function() {
	if (!library._serverLibs) {
		library._serverLibs = Runtime.serverJSONRequest({
			url: "cmd/listLibs",
			handleAs: "json",
			content:{},
			sync:true
		})[0].userLibs;
	}
	return library._serverLibs;
},

getUserLibs: function(base) {
	// not sure if we want to only allow the logged in user to view his/her
	// installed libs, or to include user name in request of target user.
	
	if(_userLibsCache.base)
		return _userLibsCache.base;
	
	_userLibsCache.base = Runtime.serverJSONRequest({
		url: "cmd/getUserLibs",
		handleAs: "json",
		content: {base: base},
		sync:true
	})[0].userLibs;
	
	return _userLibsCache.base;
},

getLibRoot: function(id, version, base) {
	var d = new Deferred();
    // check cache
	
    var cache = _libRootCache;
    if (cache[base] && cache[base][id] && cache[base][id][version] !== undefined) {
        return d.resolve(cache[base][id][version] || "");
    }
    
    if(!cache[base]) {
    	cache[base] = {};    	
    }
    
    if(!cache[base][id]) {
    	cache[base][id] = {};    	
    }

    // send server request
    return xhr.get({
    	url: "cmd/getLibRoots",
        handleAs: "json",
        content: {
            libId: id,
            version: version,
            base: base
        }
    }).then(function(response) {
        var value = response ? response[0].libRoot.root : null;
        // cache the response value
        if (!cache[id]) {
            cache[id] = {};
        }
        cache[base][id][version] = value;  
        return d.resolve(value || "");
    });
},

/*
 * JSON: [{id:'someLib', version'1.0', installed:'true', path:'/dojo'}]
 * installed and path may be left blank
 */
modifyLib: function(libChanges) {
	// not sure if we want to only allow the logged in user to view his/her installed libs, or to include user name in request of targe user.
	return Runtime.serverJSONRequest({
		url: "cmd/modifyLib",
		handleAs: "text",
		content: {libChanges: JSON.stringify(libChanges)},
		sync:true
	});
},

addLib: function(id,version) {
	// not sure if we want to only allow the logged in user to view his/her installed libs, or to include user name in request of targe user.
	return Runtime.serverJSONRequest({
		url: "cmd/getLibRoots",
		handleAs: "json",
		content: {libId: id, version: version},
		sync: true
	})[0].libRoot.root;
},

getLibraryId: function(libraryName, version) {
	// hard coded for now, if version omitted return highest version ID for library
	var libs = {sketch: "sketch", claro: "claro"};
	return libs[libraryName] + (version || "");
},

getLibraryName: function(lib) {
	var libId;
	var libVersion;
	for(var name in lib){
		libId =  name;
		libVersion = lib[libId];
	}
	return libId;
}

};


return library;

});

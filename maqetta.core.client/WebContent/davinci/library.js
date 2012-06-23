// XXX This probably shouldn't depend on davinci/ve/metadata.  This object should
//   only concern itself with the notion of a library.  Metadata is handled
//   elsewhere.
define([
    "davinci/Runtime",
    "davinci/model/Path",
	"davinci/ve/themeEditor/metadata/CSSThemeProvider",
	"davinci/ve/themeEditor/metadata/query",
	"davinci/workbench/Preferences"
//	"davinci/ve/metadata" // FIXME: circular ref?
],
function(Runtime,  Path, CSSThemeProvider, Query/*, Metadata*/, Preferences) {

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

/* if resources are deleted, we need to check if they are themes.  if so dummp the theme cache so its resynced */
dojo.subscribe("/davinci/resource/resourceChanged",this, function(type,changedResource){
	
	if(type=='deleted' || type=='renamed'){
		var Workbench = require("davinci/Workbench");
		var base = Workbench.getProject();
		var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base);
		var projectThemeBase = new Path(base).append(prefs.themeFolder);
		var resourcePath = new Path(changedResource.getPath());
		if(resourcePath.startsWith(projectThemeBase)){
			delete _themesCache[base];
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
				_themesCache[base].filter(function(entry) { return !entry.file.isVirtual(); })
				: _themesCache[base];
		}
		return rlt;
	}

	if(_themesCache[base]) {
		return result();
	}

	var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base),
		projectThemeBase = new Path(base).append(prefs.themeFolder),
		allThemes = system.resource.findResource("*.theme", false, projectThemeBase.toString());

	_themesCache[base] = allThemes.map(function(theme) {
		var t = JSON.parse(theme.getContentSync());
		t.file = theme;
		return t;
	});

	return result();
},

getThemeMetadata: function(theme) {
	/* load/find theme metadata files */
	
	if(_themesMetaCache[theme.name]) {
		return _themesMetaCache[theme.name];
	}

	var parent = new Path(theme.file.getPath()).removeLastSegments();
	var themeCssFiles = theme.files.filter(function(file) {
		return file.indexOf(".css")>-1;
	}).map(parent.append, parent);

	var metaResources = theme.meta.map(function(resource){
		var absoluteLocation = parent.append(resource);
		return system.resource.findResource(absoluteLocation.toString());
	});

	var metadata = new CSSThemeProvider(metaResources, theme.className);
	_themesMetaCache[theme.name] = {
		loader: new Query(metaResources),
		css: themeCssFiles,
		metadata: metadata
	};
	return _themesMetaCache[theme.name];
},

addCustomWidgets: function(base, customWidgetJson) {
	
	var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base);
	if(!prefs.widgetFolder){
		prefs.widgetFolder = "./widgets";
		Preferences.savePreferences('davinci.ui.ProjectPrefs', base, prefs);
	}
	
	var newJson = require("davinci/ve/metadata").parseMetaData(customWidgetJson.name, customWidgetJson, new Path(prefs.widgetFolder), true);
	
	if(!library._customWidgets[base].hasOwnProperty("name")){
		
		library._customWidgets[base].name = 'custom';
		library._customWidgets[base].metaPath = prefs.widgetFolder;
	    library._customWidgets[base].localPath = true;
	}
	library._customWidgets[base] = newJson;	
	dojo.publish("/davinci/ui/addedCustomWidget", [newJson]);
	return newJson;
},

getCustomWidgets: function(base) {
	
	if (! library._customWidgets || ! library._customWidgets[base]){
		// load the custom widgets from the users workspace
		
		if(!library._customWidgets)
			library._customWidgets = {};
		if(!library._customWidgets[base])
			library._customWidgets[base]= [];	
			
		var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		if(!prefs.widgetFolder){
			prefs.widgetFolder = "./widgets";
			Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
		}
		
		var widgetFolderSetting = new Path(base).append(prefs.widgetFolder);
		var fullPath = widgetFolderSetting.getSegments();
		parent = system.resource.findResource(fullPath[0]);
		for(var i=1;i<fullPath.length;i++){
			var folder = parent.getChildSync(fullPath[i]);
			if (folder) {
				parent = folder;
			} else {
				parent = parent.createResource(fullPath[i],true);
			}
		}
		
		var customWidgets = system.resource.findResource("*_widgets.json", false, parent);
		
		for (var i = 0; i < customWidgets.length; i++) {
			library.addCustomWidgets(base, dojo.fromJson(customWidgets[i].getContentSync()));
		}
	}
	
	return {custom: library._customWidgets[base]};

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
    // check cache
	
    var cache = _libRootCache;
    if (cache[base] && cache[base][id] && cache[base][id][version] !== undefined) {
        return cache[base][id][version];
    }
    
    if(!cache[base])
    	cache[base] = {};
    
    if(!cache[base][id])
    	cache[base][id] = {};

   // send server request
    var response = Runtime.serverJSONRequest({
        url: "cmd/getLibRoots",
        handleAs: "json",
        content: {
            libId: id,
            version: version,
            base: base
        },
        sync: true
    });
    var value = response ? response[0].libRoot.root : null;
    // cache the response value
    if (!cache[id]) {
        cache[id] = {};
    }
    cache[base][id][version] = value;
    return value;
},

getMetaRoot: function(id,version) {
	return Runtime.serverJSONRequest({
		url: "cmd/getMetaRoot",
		handleAs: "text",
		content: {id: id, version: version},
		sync:true
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
		content: {libChanges: dojo.toJson(libChanges)},
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

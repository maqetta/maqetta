// XXX This probably shoudn't depend on davinci/ve/metadata.  This object should
//   only concern itself with the notion of a library.  Metadata is handled
//   elsewhere.
define([
	"davinci/ve/themeEditor/metadata/CSSThemeProvider",
	"davinci/ve/themeEditor/metadata/query",
	"davinci/workbench/Preferences"
//	"davinci/ve/metadata" // FIXME: circular ref?
],
function(CSSThemeProvider, Query/*, Metadata*/, Preferences) {

/*
 * 
 * hard coded libraries for now, should be generated/server based in future.
 * 
 * library name: user readable name
 * library ID: library ID based on lib and version, every library/version should have unique ID.  if non given highest lvl on server assumed.
 * 
 * 
 */

var library,
	_themesCache = {},
	_themesMetaCache = {},
	_userLibsCache = {},
	themesPromise = null,
	_libRootCache = {};

// Cache library roots so we don't make multiple server calls for the same 'id' and 'version'.  But
// clear the cache when any of the libraries change.
dojo.subscribe("/davinci/ui/libraryChanged", this, function() {
    _libRootCache = {};
    _userLibsCache = {};
});

/* singleton */
library = {

themesChanged: function(base){
	if(base)
		_themesCache[base] = null;
	else
		_themesCache[base] = {};
},

getThemes: function(base, workspaceOnly, flushCache){

	if (flushCache) {
		_themesCache[base] = null;
		themesPromise = null;
	}
	
	function filter(cache){
		/* filters out workspace/non workspace values  before returning them.  always caches ALL themes */
		var rlt = [];
		for(var i=0;i<cache.length;i++){
			if(!workspaceOnly || !cache[i].file.isVirtual()){
				rlt.push(cache[i]);
			}
		}
		
		return rlt;
	}
	
	if(workspaceOnly && themesPromise){
		return themesPromise.then(function(allThemes){
			return filter(allThemes);
		});
	}
	
	if(themesPromise){
		return themesPromise;
	}
	
	var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
	var projectThemeBase = (new davinci.model.Path(base).append(prefs.themeFolder));
	var results = [];

	themesPromise= system.resource.findResource("*.theme", true, projectThemeBase.toString()).then(function(allThemesPromises){
		
		var differedList = new dojo.DeferredList(allThemesPromises);
		return differedList.then(dojo.hitch(this,function(allThemes){
			
			for (var i = 0; i < allThemes.length; i++){
				/* HELP!!!!!! TODO!!!! FIXIT!!!! i'm not sure why the deferred are coming in as an array of arrays.  each individual deferred is
				 * a single item before throwing them in the deferred list.  here each element comes in as [true, item]
				 */
				var contents = allThemes[i][1].getText();
				var t = JSON.parse(contents);
				t.file = allThemes[i][1];
				results.push(t);
			}
			_themesCache[base] = results;
			return results;
		}));
		
	
	});
	
	if(workspaceOnly){
		return themesPromise.then(function(allThemes){
			return filter(allThemes);
		});

	}
	
	return themesPromise;
	
},

getThemeMetadata: function(theme) {
	/* load/find theme metadata files */
	
	if(_themesMetaCache[theme.name])
		return _themesMetaCache[theme.name];
	
	var results = null;
	var themeCssFiles = [];
	var parent = new davinci.model.Path(theme.file.getPath());
	parent = parent.removeLastSegments();
	for(var i = 0;i<theme.files.length;i++){
		if(theme.files[i].indexOf(".css")>-1){
			themeCssFiles.push(parent.append(theme.files[i]));
		}
	}

	var metaResourcesDefPromise = [];
	for (var i = 0; i < theme.meta.length; i++) {
		var absoluteLocation = parent.append(theme.meta[i]);
		metaResourcesDefPromise.push(system.resource.findResource(absoluteLocation.toString()));
		
	}
	var defs = new dojo.DeferredList(metaResourcesDefPromise);
	var metaResources = [];
	return defs.then(dojo.hitch(this,function(metaResource){
		for(var i=0;i<metaResource.length;i++)
			/* HELP! TODO: FIXME:Why are these things coming in as arrays of [true, resource] */
			metaResources.push(metaResource[i][1]);
	})).then(dojo.hitch(this,function(){
		var metaDataLoader = new Query(metaResources);
		
		var metadata = new CSSThemeProvider(metaResources, theme.className);
		_themesMetaCache[theme.name] =  {'loader':metaDataLoader, 'css':themeCssFiles, 'metadata':metadata};
		return _themesMetaCache[theme.name];

	}));
	
	
},

addCustomWidgets: function(base, customWidgetJson) {
	var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
	if(!prefs.widgetFolder){
		prefs.widgetFolder = "./widgets";
		Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
	}
	if(!library._customWidgets[base].hasOwnProperty("name")){
		library._customWidgets[base]= customWidgetJson;	

		library._customWidgets[base].metaPath=prefs.widgetFolder;
	    library._customWidgets[base].localPath = true;

	}
	/*
	else{
		for(var name in customWidgetJson.categories){
			if(!(library._customWidgets[base].categories.hasOwnProperty(name))){
				library._customWidgets[base].categories[name] = customWidgetJson.categories[name];
			}
		}	
		for(var i=0;i<customWidgetJson.widgets.length;i++){
			library._customWidgets[base].widgets.push(customWidgetJson.widgets[i]);
		}
		
	}
	*/
	
	davinci.ve.metadata.parseMetaData(customWidgetJson.name, customWidgetJson, prefs.widgetFolder, true);
	dojo.publish("/davinci/ui/addedCustomWidget", [customWidgetJson]);
},

getCustomWidgets: function(base) {
	
	
	/* loads custom widgets from the users workspace.  removing this feature for M4 */
	
	return;
	
	if (! library._customWidgets || ! library._customWidgets[base]){
		/* load the custom widgets from the users workspace */
		
		if(!library._customWidgets)
			library._customWidgets = {};
		if(!library._customWidgets[base])
			library._customWidgets[base]= [];	
			
		var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		if(!prefs.widgetFolder){
			prefs.widgetFolder = "./widgets";
			Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
		}
		
		var widgetFolderSetting = (new davinci.model.Path(base).append(prefs.widgetFolder));
		var fullPath = widgetFolderSetting.getSegments();
		parent = system.resource.findResource(fullPath[0]);
		for(var i=1;i<fullPath.length;i++){
			var folder = parent.getChild(fullPath[i]);
			if (folder) {
				parent = folder;
			} else {
				parent = parent.createResource(fullPath[i],true);
			}
		}
		
		var customWidgets = system.resource.findResource("*_widgets.json", parent);
		
		for (var i = 0; i < customWidgets.length; i++) {
			library.addCustomWidgets(base, dojo.fromJson(customWidgets[i].getText()));
		}
	}
	
	return {custom:library._customWidgets[base]};
},

getInstalledLibs: function() {
	if (! library._serverLibs) {
		library._serverLibs = (davinci.Runtime.serverJSONRequest({url:"./cmd/listLibs", handleAs:"json", content:{},sync:true  }))[0].userLibs;
	}
	return library._serverLibs;
},

getUserLibs: function(base) {
	// not sure if we want to only allow the logged in user to view his/her
	// installed libs, or to include user name in request of targe user.
	if(! base || base === "") {
		debugger;
	}
	
	if(_userLibsCache.base)
		return _userLibsCache.base;
	
	_userLibsCache.base = davinci.Runtime.serverJSONRequest({url:"./cmd/getUserLibs", handleAs:"json", content:{'base':base },sync:true  })[0].userLibs;
	
	return _userLibsCache.base;
},

getLibRoot: function(id, version, base) {
    // check cache
	
	if(! base)
		debugger;
	
    var cache = _libRootCache;
    if ( cache[base] && cache[base][id] && cache[base][id][version]) {
        return cache[base][id][version];
    }
    
    if(!cache[base])
    	cache[base] = {};
    
    if(!cache[base][id])
    	cache[base][id] = {};
    
    if(!cache[base][id][version])
    	cache[base][id][version] = {};
    
    
    // send server request
    var response = davinci.Runtime.serverJSONRequest({
        url : "./cmd/getLibRoots",
        handleAs : "json",
        content : {
            'libId' : id,
            'version' : version,
            'base':base
        },
        sync : true
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
	return davinci.Runtime.serverJSONRequest({url:"./cmd/getMetaRoot", handleAs:"text", content:{'id':id, 'version':version},sync:true  });
},

/*
 * JSON: [{id:'someLib', version'1.0', installed:'true', path:'/dojo'}]
 * installed and path may be left blank
 */
modifyLib: function(libChanges) {
	// not sure if we want to only allow the logged in user to view his/her installed libs, or to include user name in request of targe user.
	return davinci.Runtime.serverJSONRequest({url:"./cmd/modifyLib", handleAs:"text", content:{'libChanges': dojo.toJson(libChanges)},sync:true  });
},

addLib: function(id,version) {
	// not sure if we want to only allow the logged in user to view his/her installed libs, or to include user name in request of targe user.
	return davinci.Runtime.serverJSONRequest({url:"./cmd/getLibRoots", handleAs:"json", content:{'libId':id, 'version':version},sync:true  })[0].libRoot.root;
},

getLibraryId: function(libraryName, version) {
	// hard coded for now, if version omitted return highest version ID for library
	var libs = {"sketch":"sketch","claro":"claro"};
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

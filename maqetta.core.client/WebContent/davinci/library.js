dojo.provide("davinci.library");

dojo.require("davinci.ve.themeEditor.metadata.metadata");
dojo.require("davinci.ve.themeEditor.metadata.query");

/*
 * 
 * hard coded libraries for now, should be generated/server based in future.
 * 
 * library name: user readable name
 * library ID: library ID based on lib and version, every library/version should have unique ID.  if non given highest lvl on server assumed.
 * 
 * 
 */
if(!davinci.library._themesCache)
	davinci.library._themesCache = {};

if(!davinci.library._themesMetaCache)
	davinci.library._themesMetaCache = {};

if(!davinci.library._userLibsCache)
	davinci.library._userLibsCache = {};

davinci.library.themesChanged=function(base){
	if(base)
		davinci.library._themesCache[base] = null;
	else
		davinci.library._themesCache[base] = {};
}

davinci.library.getThemes=function(base, workspaceOnly, flushCache){

	if(base==null)
		debugger;
	if(flushCache)
		davinci.library._themesCache[base] = null
	
	function result(){
		/* filters out workspace/non workspace values  before returning them.  always caches ALL themes */
		var rlt = [];
		if(davinci.library._themesCache[base]){
			
			var cache= davinci.library._themesCache[base];
			for(var i=0;i<cache.length;i++){
				if(!workspaceOnly || !cache[i].file.isVirtual()){
					rlt.push(cache[i]);
				}
			}
		}
		return rlt;
	}
	
	if(davinci.library._themesCache[base]) return result();
	
	var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
	var projectThemeBase = (new davinci.model.Path(base).append(prefs['themeFolder']));
	var allThemes = davinci.resource.findResource("*.theme", true, projectThemeBase.toString());
	var results = [];
	for (var i = 0; i < allThemes.length; i++){
		var contents = allThemes[i].getText();
		var t = eval(contents);
		t.file = allThemes[i];
		results.push(t);
	}

	davinci.library._themesCache[base] = results;
	return result();
	
}

davinci.library.getMetaData=function(theme){
	
	
	/* load/find theme metadata files */
	
	if(davinci.library._themesMetaCache[theme.name])
		return davinci.library._themesMetaCache[theme.name];
	
	var results = null;
	var themeCssFiles = [];
	var parent = new davinci.model.Path(theme.file.getPath());
	parent = parent.removeLastSegments();
	for(var i = 0;i<theme.files.length;i++){
		if(theme.files[i].indexOf(".css")>-1){
			themeCssFiles.push(parent.append(theme.files[i]));
		}
	}
	var metaResources = [];
	for(var i = 0;i<theme.meta.length;i++){
		var absoluteLocation = parent.append(theme.meta[i]);
		var resource=  davinci.resource.findResource(absoluteLocation.toString());
		metaResources.push(resource);
	}
			
	var metaDataLoader = new davinci.ve.themeEditor.metadata.query(metaResources);
	
	var metadata = new davinci.ve.themeEditor.metadata.CSSThemeProvider(metaResources,theme.className);
	davinci.library._themesMetaCache[theme.name] =  {'loader':metaDataLoader, 'css':themeCssFiles, 'metadata':metadata};
	return davinci.library._themesMetaCache[theme.name];
}


davinci.library.addCustomWidgets=function(base, customWidgetJson){
	
	var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
	if(!prefs['widgetFolder']){
		prefs.widgetFolder = "./widgets";
		davinci.workbench.Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
	}
	if(!davinci.library._customWidgets[base].hasOwnProperty("name")){
		davinci.library._customWidgets[base]= customWidgetJson;	

		davinci.library._customWidgets[base].metaPath=prefs['widgetFolder'];
	    davinci.library._customWidgets[base].localPath = true;

	}
	/*
	else{
		for(var name in customWidgetJson.categories){
			if(!(davinci.library._customWidgets[base].categories.hasOwnProperty(name))){
				davinci.library._customWidgets[base].categories[name] = customWidgetJson.categories[name];
			}
		}	
		for(var i=0;i<customWidgetJson.widgets.length;i++){
			davinci.library._customWidgets[base].widgets.push(customWidgetJson.widgets[i]);
		}
		
	}
	*/
	
	davinci.ve.metadata.parseMetaData({descriptor:customWidgetJson, metaPath:prefs['widgetFolder'], localPath:true});
	dojo.publish("/davinci/ui/addedCustomWidget", [customWidgetJson]);
}

davinci.library.getCustomWidgets=function(base){

	if(davinci.library._customWidgets==null || davinci.library._customWidgets[base]==null){
		/* load the custom widgets from the users workspace */
		
		if(!davinci.library._customWidgets)
			davinci.library._customWidgets = {};
		if(!davinci.library._customWidgets[base])
			davinci.library._customWidgets[base]= [];	
			
		var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		if(!prefs['widgetFolder']){
			prefs.widgetFolder = "./widgets";
			davinci.workbench.Preferences.savePreferences('davinci.ui.ProjectPrefs',base, prefs);
		}
		
		var widgetFolderSetting = (new davinci.model.Path(base).append(prefs['widgetFolder']));
		var fullPath = widgetFolderSetting.getSegments();
		parent = davinci.resource.findResource(fullPath[0]);
		for(var i=1;i<fullPath.length;i++){
			var folder = parent.getChild(fullPath[i]);
			if(folder!=null){
				parent = folder;
			}else{
				parent = parent.createResource(fullPath[i],true);
			}
		}
		
		var customWidgets = davinci.resource.findResource("*_widgets.json", parent);
		
		for(var i=0;i<customWidgets.length;i++){
			davinci.library.addCustomWidgets(base, dojo.fromJson(customWidgets[i].getText()));
		}
		
	}
	
	return {custom:davinci.library._customWidgets[base]};
	
}

//FIXME: should these be cached?
davinci.library.getInstalledLibs=function(){
	if(!davinci.library._serverLibs)
		davinci.library._serverLibs = (davinci.Runtime.serverJSONRequest({url:"./cmd/listLibs", handleAs:"json", content:{},sync:true  }))[0]['userLibs'];
	return davinci.library._serverLibs;
};

davinci.library.getLibMetadata = function(id, version) {
	var path = davinci.library.getMetaRoot(id, version);
	if (path == null) {
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
};


davinci.library.getUserLibs=function(base){
	// not sure if we want to only allow the logged in user to view his/her
	// installed libs, or to include user name in request of targe user.
	if(base==null || base=="")
		debugger;
	
	if(davinci.library._userLibsCache.base)
		return davinci.library._userLibsCache.base;
	
	davinci.library._userLibsCache.base = davinci.Runtime.serverJSONRequest({url:"./cmd/getUserLibs", handleAs:"json", content:{'base':base },sync:true  })[0]['userLibs'];
	
	return davinci.library._userLibsCache.base;

}

// Cache library roots so we don't make multiple server calls for the same 'id' and 'version'.  But
// clear the cache when any of the libraries change.
davinci.library._libRootCache = {};
dojo.subscribe("/davinci/ui/libraryChanged", this, function() {
    davinci.library._libRootCache = {};
    davinci.library._userLibsCache = {};
});

davinci.library.getLibRoot = function(id, version, base) {
    // check cache
	
	if(base==null)
		debugger;
	
    var cache = davinci.library._libRootCache;
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
    var value = response ? response[0]['libRoot']['root'] : null;
    // cache the response value
    if (!cache[id]) {
        cache[id] = {};
    }
    cache[base][id][version] = value;
    return value;
};

davinci.library.getMetaRoot=function(id,version){
	
	var response = davinci.Runtime.serverJSONRequest({url:"./cmd/getMetaRoot", handleAs:"text", content:{'id':id, 'version':version},sync:true  });

	return response;
}

/*
 * JSON: [{id:'someLib', version'1.0', installed:'true', path:'/dojo'}]
 * installed and path may be left blank
 */
davinci.library.modifyLib=function(libChanges){
	
	
	// not sure if we want to only allow the logged in user to view his/her installed libs, or to include user name in request of targe user.
		
		var response = davinci.Runtime.serverJSONRequest({url:"./cmd/modifyLib", handleAs:"text", content:{'libChanges': dojo.toJson(libChanges)},sync:true  });
		return response;
		
}

davinci.library.addLib=function(id,version){
	// not sure if we want to only allow the logged in user to view his/her installed libs, or to include user name in request of targe user.
		
		var response = davinci.Runtime.serverJSONRequest({url:"./cmd/getLibRoots", handleAs:"json", content:{'libId':id, 'version':version},sync:true  })[0]['libRoot']['root'];
	
		return response;
		
}

davinci.library.getLibraryId=function(libraryName, version){
	// hard coded for now, if version omitted return highest version ID for library
	var libs = {"sketch":"sketch","claro":"claro"};
	return libs[libraryName] + (version || "");
	
	
}

davinci.library.getLibraryName=function(lib){
	
	var libId;
	var libVersion;
	for(var name in lib){
		libId =  name;
		libVersion = lib[libId];
	}
	return libId;
	
}
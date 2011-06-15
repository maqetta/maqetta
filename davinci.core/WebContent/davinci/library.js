dojo.provide("davinci.library");
/*
 * 
 * hard coded libraries for now, should be generated/server based in future.
 * 
 * library name: user readable name
 * library ID: library ID based on lib and version, every library/version should have unique ID.  if non given highest lvl on server assumed.
 * 
 * 
 */

davinci.library.getThemes=function(){
	
	var allThemes = davinci.resource.findResource("*.theme");
	var results = [];
	for (var i = 0; i < allThemes.length; i++){
		var contents = allThemes[i].getContents();
		var t = eval(contents);
		t.file = allThemes[i];
		results.push(t);
	}
	return results;
}

davinci.library.getMetaData=function(theme){
	/* load/find theme metadata files */
	var results = null;
	var themeCssFiles = [];
	var parent = new davinci.model.Path(theme.file.getPath());
	parent.removeLastSegments();
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
	return {'loader':metaDataLoader, 'css':themeCssFiles, 'metadata':metadata};
	
}

//FIXME: should these be cached?
davinci.library.getInstalledLibs=function(){
	return (davinci.Runtime.serverJSONRequest({url:"./cmd/listLibs", handleAs:"json", content:{},sync:true  }))[0]['userLibs'];
}
davinci.library.getlibMetaData=function(id, version){
	
	var path = davinci.library.getMetaRoot(id, version);
	
    var data = dojo.xhrGet({
        url : path + "/widgets.json",
        sync : true, // XXX should be async
        handleAs: "text"
    });
   
    var result = {'data':data['results'][0], 'metaPath':path};
   
    return result;
	//return (davinci.Runtime.serverJSONRequest({url:"./cmd/getLibMetadata", handleAs:"json", content:{'id': id, 'version':version},sync:true  }));
}

davinci.library.getUserLibs=function(base){
	// not sure if we want to only allow the logged in user to view his/her installed libs, or to include user name in request of targe user.

	return davinci.Runtime.serverJSONRequest({url:"./cmd/getUserLibs", handleAs:"json", content:{'base':base },sync:true  })[0]['userLibs'];
	

}

// Cache library roots so we don't make multiple server calls for the same 'id' and 'version'.  But
// clear the cache when any of the libraries change.
davinci.library._libRootCache = {};
dojo.subscribe("/davinci/ui/libraryChanged", this, function() {
    davinci.library._libRootCache = {};
});

davinci.library.getLibRoot = function(id, version, base) {
    // check cache
    var cache = davinci.library._libRootCache;
    if (cache[id] && cache[id][version]) {
        return cache[id][version];
    }
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
    cache[id][version] = value;
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
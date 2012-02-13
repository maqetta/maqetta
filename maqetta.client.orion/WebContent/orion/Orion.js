define([
	"dojo/_base/declare",
	'system//a/bootstrap',
    'orion/fileClient',
    "dojo/domReady!"
], function (declare, mBootstrap, mFileClient) {
	
	var serviceRegistry;
	var preferences;
	var pluginRegistry;
	var fileClient;
	var loaded = new dojo.Deferred();
	
	
	function getWorkspace(){
		
		return "workspace";
	}
	
	function getLibrarys(){
		return dojo.xhrGet( {
			url:"/maqetta/cmd/listLibs",
			handleAs:"json"
		}).then(function(results){
			return results[0].userLibs;
		});
	}
	
	
	function getUser(){
		/* needs to be Workbench.getUser(); */
		
		return "A";
	}
	
	function getRootURL(){
		return "/" + getWorkspace() + "/" + getUser();
	}
	
	function _createMaqettaProject(projectName){
		return getLibrarys().then(function(librarys){
			debugger;
			fileClient.createProject(getRootURL(), projectName).then(function(){
			/* setup maqetta project */
				debugger;
				/*
				var projectPath = getRootURL() + "/" + projectName;
				
				for(var i=0;i<librarys.length;i++){
					fileClient.createFolder(projectPath + "/" + librarys[i].root)
					
				}
				fileClient.createFolder(projectPath + "/" + ".settings").then(function(){
					fileClient.write(projectPath + "/" + ".settings", dojo.toJson(librarys));
				})
				*/
			
		})})
	}
	
	mBootstrap.startup().then(function(core) {
			serviceRegistry = core.serviceRegistry;
			preferences = core.preferences;
			pluginRegistry = core.pluginRegistry;
			var root = [];
			fileClient = new mFileClient.FileClient(serviceRegistry);
			//fileClient.loadWorkspaces("");
			
			fileClient.loadWorkspace("").then(dojo.hitch(this,
					function(){
					
						_createMaqettaProject("project1").then(function(){
								loaded.resolve(this)
							}
						);						
						
						
					}
						
			));
		});
		
	
	
	
	function setPreference(name, value){
		
	}
	
	function getPreference(name){
		
	}
	

					
//		var fileServices = serviceRegistry.getServiceReferences("orion.core.file");

	//var contentTypeService = new mContentTypes.ContentTypeService(serviceRegistry);
	
	return {
		
		
		createMaqettaProject : function(name){
			return loading.then(dojo.hitch(this,function(){
				return _createMaqettaProject(name)
			}));
		},
	
		listFiles : function(location, onComplete){
			
			return loaded.then(dojo.hitch(this,function(){
				
					return fileClient.fetchChildren(location).then(function(results){ 
					debugger;
						return children;
					});
			}));
		},
		
		getRootURL : getRootURL,
		
		findResource : function(name, ignoreCase, inFolder){
			
			return loaded.then(dojo.hitch(this,function(){
				return fileClient.search( "", "?q=" + name).then(function(results){ 
					debugger;
					return results;
				});
			}));
		},
		
		setPreference : function(name, value){
			return setPreference(name, value)
		},
		
		getPreference : function(name){
			return getPreference(name);
		},
		
	};
	
});
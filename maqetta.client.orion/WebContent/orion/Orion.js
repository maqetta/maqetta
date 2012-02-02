define([
	"dojo/_base/declare",
	'system//a/bootstrap',
    'orion/fileClient',
    "dojo/domReady!"
], function (declare, mBootstrap, mFileClient) {
	
	var serviceRegistry;
	var preferences;
	var pluginRegistry;
	
		mBootstrap.startup().then(function(core) {
			debugger;
			serviceRegistry = core.serviceRegistry;
			preferences = core.preferences;
			pluginRegistry = core.pluginRegistry;
			var root = [];
			var fileClient = new mFileClient.FileClient(serviceRegistry);
			fileClient.loadWorkspaces("");
			
			fileClient.loadWorkspace("").then(
					
					//do we really need hitch - could just refer to self rather than this
					dojo.hitch(self, function(loadedWorkspace) {
						debugger;
						
						//copy fields of resulting object into the tree root
						for (var i in loadedWorkspace) {
							root[i] = loadedWorkspace[i];
						}
					}
						
			));
		});
		
		
	
	
	function setPreference(name, value){
		
	}
	
	function getPreference(name){
		
	}
	
	function createMaqettaProject(name){
		
	}
					
//		var fileServices = serviceRegistry.getServiceReferences("orion.core.file");

	//var contentTypeService = new mContentTypes.ContentTypeService(serviceRegistry);
	
	return {
		
		
		createProject : function(projectName){
			
		},
	
		listFiles : function(location, onComplete){
			this.fileClient.fetchChildren(location).then( 
					dojo.hitch(this, function(children) {
						onComplete(children);
					})
				);
		},
		
		setPreference : function(name, value){
			return setPreference(name, value)
		},
		
		getPreference : function(name){
			return getPreference(name);
		},
		
	};
	
});
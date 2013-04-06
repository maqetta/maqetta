define(["require",
        "dojo/_base/declare",
        "dojo/_base/xhr",
        "dojo/Deferred",
        "davinci/model/Path",
        "davinci/Runtime", // TODO: remove this
//        "davinci/Workbench",
        "davinci/model/resource/Folder"
],function(require, declare, xhr, Deferred, Path, Runtime, Folder){
var Resource = {

	root: null,

	__CASE_SENSITIVE: false,

	resourceChanged: function(type,changedResource){
		
		if (type !== 'deleted' && changedResource == system.resource.getRoot()) {
			changedResource.reload();
			system.resource.getRoot().getChildrenSync(dojo.hitch(system.resource,function(children){
				system.resource.onChildrenChange(system.resource.getRoot(),children);
			})); //TODO: need error handler
			return system.resource.getRoot();
		}else if (type == 'created' || type == 'deleted' || type == 'renamed' || type == 'updated' || type=='reload'){
			var parent, resourcePath;
			
			if(changedResource.parent){
				/* already created model object */
				parent = changedResource.parent;
				resourcePath = changedResource.getPath();
			}else{
				/* find the resource parent */
				var p1 = new Path(changedResource).removeLastSegments();
				parent = system.resource.findResource(p1.toString()) || system.resource.getRoot();
				resourcePath = changedResource;
			}
			/* if deleting a folder, delete it's children first.  this is for the dijit tree 
			 * (which seems to cache the object) issue #1780 */
			if(type=='deleted' && changedResource.elementType=='Folder'){
				system.resource.onChildrenChange(changedResource,[]);
			}
			
			if(parent.elementType=="Folder" && type=='reload'){
				/* 'reload' forces a full parent reload.  most model actions handle the server
				 * command and the modeling commands, so forcing a client & server resource sync isn't usually neccisary.
			     */
				parent.reload();
			}

			if (type == "renamed") {
				system.resource.onChange(changedResource);
			}
			
			/* force the resource parent to update its children */
			parent.getChildrenSync(function(children){system.resource.onChildrenChange(parent, children);}, function(e){console.error(e);}); // TODO: error handler	
		}
		
		if(type=='deleted'){
			/* make sure the resource tree has 'deselected' the deleted resource */
			var resourceTree = dijit.byId('resourceTree');
			resourceTree.attr('selectedItem', null);
		}
	},

	/*
	 * generates text content of a given type with options
	 * 
	 * @param type html, js, css etc..
	 * @param options Object {'theme':'claro'}
	 * 
	 */
	createText: function(type, options){
//		switch(type){
//		default:
			return "";
//		}
	},
	
	createResource: function(fullPath,  isFolder, parent){
		var namesplit = fullPath.split("/");
		parent = parent || system.resource.getWorkspace();
		var length = !isFolder? namesplit.length-1 : namesplit.length;
			for(var i=0;i<length;i++){
				if(namesplit[i]=="." || namesplit[i]=="") {
					continue;
				}
				
				var folder = parent.getChildSync(namesplit[i]);
				if(folder!=null){
					parent = folder;
				}else{
					parent = parent.createResource(namesplit[i],true);
				}
			}
			if(!isFolder){
				parent = parent.createResource(namesplit[namesplit.length-1]);
			}
		return parent;
	},
	
	listProjects: function(onComplete, onError){
		
		/*
		 *  projects are the first folder children of the workspace.
		 *  may turn this into its own command.   
		 */
		var parent =  system.resource.getRoot();
		if(parent.parent)
			parent = parent.parent;
		
		parent.getChildren(onComplete, onError);
	},
	
	createProject: function(params) {
		return xhr.get({
			url: "cmd/createProject",
			handleAs: "text",
			content: {
				name: params.newProjectName,
				projectToClone: params.projectToClone,
				eclipseSupport: !!params.eclipseSupport, // force boolean, in case of null/undef
				projectTemplate: params.projectTemplateName
			}
		});
	},
	
	/* Resource tree model methods */
	newItem: function(/* Object? */ args, /*Item?*/ parent){
	},
	
	pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy){
	},
	
	
	onChange: function(/*dojo.data.Item*/ item){
	},
	
	onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
//		console.log("parent:" + parent + " children :" + newChildrenList);
	},
	
	getLabel: function(/*dojo.data.Item*/ item){
		
		var label=item.getName();
		if (item.link){
			label=label+'  ['+item.link+']';
		}
		return label;
	},

	getIdentity: function(/* item */ item){
		return item.getId();
	},
	
	destroy: function(){
		system.resource.subscriptions.forEach(dojo.unsubscribe);
	},
		
	mayHaveChildren: function(/*dojo.data.Item*/ item){
	    return item.elementType=="Folder";
	},

	getRoot: function(onComplete, onError){
		if (!system.resource.root){
			var workspace = system.resource.getWorkspace(),
				Workbench = require("davinci/Workbench");
			if(Workbench.singleProjectMode()){
				var project = Workbench.getProject();
				system.resource.root = system.resource.findResource(project, false, workspace);
			}else{
				system.resource.root = workspace;
			}
			system.resource.root._readOnly = false;
		}
		
		if(onComplete){
			onComplete(system.resource.root);
		}else{
			return system.resource.root;
		}
	},
	
	getWorkspace: function(){
		if(!this.workspace){
			this.workspace = new Folder(".",null);
		}
		return this.workspace;
	},

	getChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete, /*function*/ onError){
		parentItem.getChildren(onComplete, onError);
	},

	copy: function(sourceFile, destFile, recurse){
		var path = sourceFile.getPath? sourceFile.getPath() : sourceFile;
		var destPath = destFile.getPath? destFile.getPath() : destFile;
		var response = Runtime.serverJSONRequest({
			url:"cmd/copy", 
			handleAs:"text", 
			sync:true,
			content:{source:path, dest: destPath, recurse: String(recurse)}
		});
		/* force a reload since we dont really know if this is a file or directory being copied */
		system.resource.resourceChanged("reload", destFile);
	},

	//TODO: use options hash arg in place of root, libs
	download: function(files, archiveName, root, userLibs, options){
		
		/* using a servlet to create the file on the fly from the request, 
		   this will eliminate delay from download click to actual start
		*/
		var libString = "";
		var rootString = "";
		
		if(userLibs) {
			libString = "&libs="+encodeURIComponent(dojo.toJson(userLibs));
		}
		
		if(root) {
			rootString = "&root="+ encodeURIComponent(root);
		}

		if (options) {
			for (var name in options) {
				rootString += "&" + encodeURIComponent(name) + "=" + encodeURIComponent(options[name]);
			}
		}
		
		window.location.href= "cmd/download?fileName=" + archiveName + rootString + "&resources="+encodeURIComponent(dojo.toJson(files))+libString;
	},
	
	
	/**
	 * @param name  Path of resource to find.  May include wildcard.
	 * @param ignoreCase
	 * @param inFolder  String or Resource object in which to start search.
	 * @returns  Promise
	 */
	findResourceAsync: function(name, ignoreCase, inFolder, workspaceOnly) {
		// Deferred API placeholder until we have a real async implementation
		var promise = new Deferred();
		var resource = this.findResource(name, ignoreCase, inFolder, workspaceOnly);
		if (resource) {
			promise.resolve(resource);
		} else {
			promise.reject();
		}
		return promise;
	},

	/**
	 * @param name  Path of resource to find.  May include wildcard.
	 * @param ignoreCase
	 * @param inFolder  String or Resource object in which to start search.
	 * @returns  Resource
	 */
	findResource: function(name, ignoreCase, inFolder, workspaceOnly){
		ignoreCase = ignoreCase || !system.resource.__CASE_SENSITIVE;
		var seg1 = 0,segments;
		var resource = system.resource.getWorkspace();
		if (inFolder) {
		    if (typeof inFolder == 'string') {
		    	var tInFolder = inFolder;
		        inFolder = system.resource.findResource(inFolder, ignoreCase);
		        if (!inFolder) {
		        	console.error('resource.findResoure: Folder '+ tInFolder +' not found');
		        	return null; 
		        }
		    }
		    resource = inFolder;
		}
		if (typeof name == 'string') {
			segments = name.split('/');
			if (segments[0] == '.'){
				seg1 = 1;
			}
		} else if (name.getSegments) {
			segments = name.getSegments();
			name = name.toString();
		}

		var isWildcard = segments.some(function(segment){
			return segment.indexOf("*") != -1;
		});
		
		var serverFind;
		function doFind()
		{
			for (var i=seg1;i<segments.length;i++)
			{
				var found=null;
//				resource.getChildrenSync(function(){}, true);
				if (!resource._isLoaded )
				{
					serverFind=true;
					break;
				}
				//#23
				if (segments[i] == '..') {
					//parent
					found = resource = resource.parent;
				}else if(segments[i] != '.'){ // check for self
					found = resource = resource.getChildSync(segments[i]);
				} // else it was self so we just increment to the next segment
				// #23
				//found=resource=resource.getChildSync(segments[i]);
				if (!found) {
				  return;
				}
			}
			return found;			
		}
		
		var found;
		if (!isWildcard){
			found=doFind();
		}

		var foundResources = [];
		if (!found && (serverFind || isWildcard))
		{			
			var response = Runtime.serverJSONRequest({
				url: "cmd/findResource", 
				content:{
					path: name,
					ignoreCase: ignoreCase,
					workspaceOnly: workspaceOnly,
					inFolder: inFolder ? inFolder.getPath() : null
				},
				sync:true
			});
			
			if (response && response.length)
			{
				foundResources = response.map(function(foundFile) {
					var loadResource = system.resource.getWorkspace();
					for (var j=0;j<foundFile.parents.length;j++) {
						if (!loadResource._isLoaded) {
							loadResource.setChildrenSync(foundFile.parents[j].members);
						}
						if (j + 1 < foundFile.parents.length) {
							var name = foundFile.parents[j+1].name;
							var newResource = loadResource.getChildSync(name);
							if (!newResource) {
								newResource = new Folder(name,loadResource);
							}
							loadResource=newResource;
						}
					}
					resource = system.resource.getWorkspace();
					seg1 = 0;
					segments = foundFile.file.split('/');
					if (segments[0] == '.') {
						seg1 = 1;
					}

					return doFind();
				});
			}
			//TODO: what if !response?
		} else {
			foundResources = [found];
		}
		return isWildcard ? foundResources : foundResources[0];
	},

	alphabeticalSort: function(items){
		return items.sort(function(a,b) {
			a = a.name.toLowerCase();
			b = b.name.toLowerCase();
			return a < b ? -1 : (a > b ? 1 : 0);
		});
	}
};

	var subscriptions = [dojo.subscribe("/davinci/resource/resourceChanged", Resource, function(){return Resource.resourceChanged;}())];
	return dojo.setObject("system.resource", Resource);
});

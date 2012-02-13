define(["require",
        "dojo/_base/declare",
        "dojo/_base/Deferred",
        "davinci/model/Path",
        "davinci/Runtime",
//        "davinci/Workbench",
        "davinci/model/resource/Folder"
],function(require, declare,Deferred, Path, Runtime, Folder){
var resource = {
	root:null,
	
	__CASE_SENSITIVE:false,
	
	
	resourceChanged: function(type,changedResource){
		var parentPromise = null;
		var deferred = new dojo.Deferred();
		
		if(changedResource!=null && changedResource==resource.root){
			changedResource.reload();
			resource.root.getChildren().then(function(children){
				resource.onChildrenChange(root,children);
			});
			deferred.resolve(resource.root);
			return deferred;
		}else if (type == 'created' || type == 'deleted' || type == 'renamed' || type == 'updated' || type=='reload'){
			var parent, resourcePath;
			
			if(changedResource.parent){
				/* already created model object */
				parentPromise = new Deferred();
				parentPromise.resolve(changedResource.parent);
				resourcePath = changedResource.getPath();
			}else{
				/* find the resource parent */
				var p1 = (new Path(changedResource)).removeLastSegments();
				parentPromise = resource.findResource(p1.toString()) || resource.getRoot();
				resourcePath = changedResource;
			}
			
			return parentPromise.then(function(parent){
				if(parent.elementType=="Folder" && type=='reload'){
					/* 'reload' forces a full parent reload.  most model actions handle the server
					 * command and the modeling commands, so forcing a client & server resource sync isn't usually neccisary.
				     */
					parent.reload();
				}
				
				/* force the resource parent to update its children */
				return parent.getChildren().then(function(children){
					resource.onChildrenChange(parent,children);
					return children;
				});
			});
			
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
	createText : function(type, options){
//		switch(type){
//		default:
			return "";
//		}
	},
	
	
	
	createResource : function(fullPath,  isFolder, parent){
		var namesplit = fullPath.split("/");
		parent = parent || system.resource.getWorkspace();
		var length = !isFolder? namesplit.length-1 : namesplit.length;
			for(var i=0;i<length;i++){
				if(namesplit[i]=="." || namesplit[i]=="") continue;
				
				var folder = parent.getChild(namesplit[i]);
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
	
	_createResource : function(fullPath,  isFolder, parent){
		var namesplit = fullPath.split("/");
		var parentPromise = new Deferred();
		
		
		
		parent = parent || resource.getWorkspace();
		
		
			var length = !isFolder? namesplit.length-1 : namesplit.length;
			for(var i=0;i<length;i++){
				if(namesplit[i]=="." || namesplit[i]=="") continue;
				
				var folder = parent.getChild(namesplit[i]);
				if(folder!=null){
					parent = folder;
				}else{
					return parent.createResource(namesplit[i]);
				}
			}
			if(!isFolder){
				return parent.createResource(namesplit[namesplit.length-1]);
			}
		
		
		
		return parent;
	},
	
	listProjects : function(){
		/*
		 *  projects are the first folder children of the workspace.
		 *  may turn this into its own command.   
		 */
		return resource.getWorkspace().getChildren();
	},
	
	createProject : function(projectName, initContent, eclipseSupport){
			 return Runtime.serverJSONRequest({url:"cmd/createProject", handleAs:"text", content:{"name": projectName, "initContent": initContent, 'eclipseSupport': eclipseSupport}});
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
		return item.getPath();
	},
	
	destroy: function(){
		resource.subscriptions.forEach(dojo.unsubscribe);
	},
		
	mayHaveChildren: function(/*dojo.data.Item*/ item){
	    return item.elementType=="Folder";
	},
	
	getRoot: function(onItem){
		var rootPromise = null;
		
		if (!resource.root){
			var workspace = resource.getWorkspace(),
				Workbench = require("davinci/Workbench");
			if(Workbench.singleProjectMode()){
				var project = Workbench.getProject();
				rootPromise = resource.findResource(project,false, workspace);
			}else{
				rootPromise = new Deferred();
				
				rootPromise.resolve(workspace);
				
			}
			dojo.when(rootPromise, onItem); 
			return rootPromise.then(function(rootResource){
				resource.root = rootResource;
				resource.root._readOnly = false;
				return resource.root;
			});
			
		}
		
		rootPromise = new Deferred();
		rootPromise.resolve(resource.root);
		dojo.when(rootPromise, onItem); 
		
		return rootPromise;
	},
	
	getWorkspace: function(){
		if(!this.workspace){
			this.workspace = new Folder(".",null);
		}
		return this.workspace;
	},
	
	getChildren: function(/*dojo.data.Item*/ parentItem, onComplete, onError){
	
		var childrenPromise =  parentItem.getChildren(); // need to make the call sync, chrome is to fast for async (ALP: what does this mean?)
		dojo.when(childrenPromise, onComplete); 
		return childrenPromise;
	},
	
	copy: function(sourceFile, destFile, recurse){
		var path = sourceFile.getPath? sourceFile.getPath() : sourceFile;
		var destPath = destFile.getPath? destFile.getPath() : destFile;
		var copy = Runtime.serverJSONRequest({
			url:"cmd/copy", 
			handleAs:"text", 
			sync:false,
			content:{source:path, dest: destPath, recurse: String(recurse)}  });
		/* force a reload since we dont really know if this is a file or directory being copied */
		return copy.then(function(){
			return resource.resourceChanged("reload", destFile);
		});
		
	},

	download: function(files,archiveName, root, userLibs){
		
		/* using a servlet to create the file on the fly from the request, 
		   this will eliminate delay from download click to actual start
		*/
		var libString = "";
		var rootString = "";
		
		if(userLibs)
			libString = "&libs="+escape(dojo.toJson(userLibs));
		
		if(root)
			rootString = "&root="+ escape(root);
		
		window.location.href= "cmd/download?fileName=" + archiveName + rootString + "&resources="+escape(dojo.toJson(files))+libString ;
	},
	
	
	/**
	 * @param name  Path of resource to find.  May include wildcard.
	 * @param ignoreCase
	 * @param inFolder  String or Resource object in which to start search.
	 * @returns  Resource
	 */
	findResource: function(name, ignoreCase, inFolder, workspaceOnly){
		
		ignoreCase=ignoreCase || !resource.__CASE_SENSITIVE;
		var seg1=0,segments;
		var bResource=resource.getWorkspace();
		
		if (inFolder) {
		    if (typeof inFolder == 'string') {
		        return this.findResource(inFolder, ignoreCase).then(dojo.hitch(this,function(foundFolder){
		        	return this.findResource(name,ignoreCase,foundFolder,workspaceOnly);
		        }));
		    }
		  
		}
		var foundResources=[];
		if (typeof name=='string') {
			segments=name.split('/');
			if (segments[0]=='.'){
				seg1=1;
			}
		} else if (name.getSegments) {
			segments=name.getSegments();
			name=name.toString();
		}
		var isWildcard;
		for (var i=0;i<segments.length;i++) { //FIXME: use filter()
			if (segments[i].indexOf("*") >= 0) {
				isWildcard=true;
				break;
			}
		}
		
		var serverFind;
		var found=null;
		
		function doFind(){
			
			for (var i=seg1;i<segments.length;i++){
				var deferred = new Deferred();
				found=null;
				if (bResource.elementType=="Folder" && !bResource.isLoaded() ){
					serverFind=true;
					break;
				}
//					resource.getChildren(function(){}, true);
				found=bResource=bResource.getChild(segments[i]);
				if (!found) {
				  return;
				}
			}
			if(found!=null){
				deferred.resolve(found);
				return deferred;
			}
			return null;			
		}
		
		var found;
		if (!isWildcard){
			found=doFind();
		}
		if (!found && (serverFind || isWildcard)){			
				return Runtime.serverJSONRequest({
								url:"cmd/findResource", 
								content:{path: name, 
										 ignoreCase: ignoreCase, 
										 workspaceOnly: workspaceOnly, 
										 inFolder: inFolder!=null?inFolder.getPath():null}, 
										 sync:false  
							    }).then(function(response){
							    	
							    	if (response && response.length>0){
										for (var i=0;i<response.length;i++){
											var foundFile=response[i];
											var loadResource=resource.getWorkspace();

											for (var j=0;j<foundFile.parents.length;j++){
												if (!loadResource._isLoaded){
													loadResource._addFiles(foundFile.parents[j].members);
												}
												if (j+1<foundFile.parents.length){
													var name=foundFile.parents[j+1].name;
													var newResource=loadResource.getChild(name);
													if (!newResource) {
														newResource= new Folder(name,loadResource);
													}
													loadResource=newResource;
												}
												
											}
											bResource=resource.getWorkspace();
											seg1=0;
											segments=foundFile.file.split('/');
											if (segments[0]=='.') {
												seg1=1;
											}

											foundResources[i]=doFind();
										}
									}
							    	return isWildcard ? foundResources : foundResources[0];
							    });
			
			
		}else {
			foundResources[0]=found;
		}
		var f1 = isWildcard ? foundResources : foundResources[0];
		
		if(f1==null){
			var def = new dojo.Deferred();
			def.resolve(null);
			return def;
		}
		return f1;
		
	},
	alphabeticalSort: function(items){
		return items.sort(function(a,b) {
			a = a.name.toLowerCase();
			b = b.name.toLowerCase();
			return a < b ? -1 : (a > b ? 1 : 0);
		});
	}
};

	var subscriptions = [dojo.subscribe("/davinci/resource/resourceChanged",resource, function(){return resource.resourceChanged;}())];
	return dojo.setObject("system.resource", resource);
});

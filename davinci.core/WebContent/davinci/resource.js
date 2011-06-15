dojo.provide("davinci.resource");
dojo.provide("davinci.resource.FileTypeFilter");
dojo.provide("davinci.resource.alphabeticalSortFilter");
dojo.provide("davinci.resource.foldersFilter");
dojo.require("davinci.model.Resource");

davinci.resource.subscriptions = [];


dojo.mixin(davinci.resource, {
	root:null,
	
	__CASE_SENSITIVE:false,
	
	resourceChanged: function(type,changedResource){
		if (type == 'created' || type == 'deleted' || type == 'renamed')
		{
			var parent=changedResource.parent;
			var newChildren;
			parent.getChildren(function(children){newChildren=children});
			this.onChildrenChange(parent,newChildren);
		}
	},
	
	subscriptions: [dojo.subscribe("/davinci/resource/resourceChanged",this, function(){return davinci.resource.resourceChanged}())],

	root: null,
	
	/* Resource tree model methods */
	newItem: function(/* Object? */ args, /*Item?*/ parent){
	},
	
	pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy){
	},
	
	
	onChange: function(/*dojo.data.Item*/ item){
	},
	
	onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
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
	
	workspaceChanged: function(){
		delete this.root;
		this.root=davinci.resource.getRoot();
		this.root.getChildren(dojo.hitch(this, function(children){
			this.onChildrenChange(this.root,children)
		}));
	},
		
	destroy: function(){
		for(var i=0;i<this.subscriptions.length;i++){
			dojo.unsubscribe(this.subscription[i]);
		}
	},
		
		
	mayHaveChildren: function(/*dojo.data.Item*/ item){
	    return item.elementType=="Folder";
	},
	getRoot: function(onComplete){
		
		if (!this.root){
			this.root=new davinci.model.Resource.Folder(".",null);
		}
		
		if(onComplete){
			onComplete(this.root);
		}else{
			return this.root;
		}
	},
	
	getChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete){
		parentItem.getChildren(onComplete, true); // need to make the call sync, chrome is to fast for async
	},
	
	_createResource: function(path){
		var path = new davinci.model.Path(path).removeLastSegment();
		
		var folder = davinci.resource.findResource(path) || this.root;
		
		folder.getChildren(dojo.hitch(this,function(children){
			this.onChildrenChange(folder,children);
		}));
			
	},
	
	copy: function(sourceFile, destFile, recurse){
		var path = sourceFile.getPath? sourceFile.getPath() : sourceFile;
		var destPath = destFile.getPath? destFile.getPath() : destFile;
		var response = davinci.Runtime.serverJSONRequest({
			url:"./cmd/copy", 
			handleAs:"text", 
			sync:true,
			content:{'source':path, 'dest' : destPath, 'recurse': new String(recurse)}  });
	
		this.resourceChanged(destFile, "created");
		
	},

	download: function(files,archiveName){
		
		/* using a servlet to create the file on the fly from the request, 
		   this will eliminate delay from download click to actual start
		*/
		window.location.href= "./cmd/download?fileName=" + archiveName + "&resources="+escape(dojo.toJson(files));
	},
	


	
	
	/**
	 * @param name  Path of resource to find.  May include wildcard.
	 * @param ignoreCase
	 * @param inFolder  String or Resource object in which to start search.
	 * @returns  Resource
	 */
	findResource: function(name, ignoreCase, inFolder, workspaceOnly){
		ignoreCase=ignoreCase || !this.__CASE_SENSITIVE;
		var seg1=0,segments;
		var resource=this.root;
		if (inFolder) {
		    if (typeof inFolder == 'string') {
		        inFolder = this.findResource(inFolder, ignoreCase);
		    }
		    resource = inFolder;
		}
		var foundResources=[];
		if (typeof name=='string') {
			segments=name.split('/');
			if (segments[0]=='.')
				seg1=1;
		} else if (name.getSegments) {
			segments=name.getSegments();
			name=name.toString();
		}
		var isWildcard;
		for (var i=0;i<segments.length;i++) {
			if (segments[i].indexOf("*") >= 0) {
				isWildcard=true;
				break;
			}
		}
		
		var serverFind;
		function doFind()
		{
			for (var i=seg1;i<segments.length;i++)
			{
				var found=null;
				if (!resource._isLoaded )
				{
					serverFind=true;
					break;
				}
//					resource.getChildren(function(){}, true);
				found=resource=resource._getChild(segments[i]);
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
		if (!found && (serverFind || isWildcard))
		{			
			var response = davinci.Runtime.serverJSONRequest({
				  url:"./cmd/findResource", 
			          content:{'path': name, 'ignoreCase' : ignoreCase, 'workspaceOnly' : workspaceOnly, 'inFolder':inFolder!=null?inFolder.getPath():null},sync:true  });
			
			if (response && response.length>0)
			{
				for (var i=0;i<response.length;i++)
				{
					var foundFile=response[i];
					var loadResource=this.root;

					for (var j=0;j<foundFile.parents.length;j++)
					{
						if (!loadResource._isLoaded)
						{
							loadResource._addFiles(foundFile.parents[j].members);
						}
						if (j+1<foundFile.parents.length)
						{
							var name=foundFile.parents[j+1].name;
							var newResource=loadResource._getChild(name);
							if (!newResource) {
								newResource= new davinci.model.Resource.Folder(name,loadResource);
							}
							loadResource=newResource;
						}
						
					}
					var resource=this.root;
					seg1=0;
					segments=foundFile.file.split('/');
					if (segments[0]=='.') {
						seg1=1;
					}

					foundResources[i]=doFind();
				}
			}
		}
		else {
			foundResources[0]=found;
		}
		return isWildcard ? foundResources : foundResources[0];
	}
	
});

dojo.declare("davinci.resource.alphabeticalSortFilter",null,{
   filterList: function(list)
   {
	    return list.sort(function (file1,file2)
	    	{return file1.name>file2.name ? 1 : file1.name<file2.name ? -1 : 0});
   }

});

dojo.declare("davinci.resource.foldersFilter",null,{
   filterItem: function(item)
   {
       if (item.elementType=='File') {
	    	return true;
       }
   }
});
dojo.declare("davinci.resource.FileTypeFilter",null,{
    constructor: function(types)
    {
	this.types=types.split(",");
    },
    filterList: function(list)
    {
		var newList=[];
		for (var i=0;i<list.length;i++)
		{
			var resource=list[i];
			if (resource.elementType!="File"){
				newList.push(resource);
			}
			else
			{
				for (var j=0;j<this.types.length;j++)
				{
					if (resource.getExtension()==this.types[j] || this.types[j]=="*")
					{
						newList.push(resource);
						break;
					}
				}
			}
		}
		return newList;
    }
});

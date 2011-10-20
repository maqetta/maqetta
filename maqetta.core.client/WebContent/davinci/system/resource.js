/* base api for system.resource */

define(["dojo/_base/declare"],function(declare){

	return declare("davinci.system.resource", [/* extends nothing */], {
		resourceChanged: function(type,changedResource){},

		listProjects : function(callBack){},
		
		createProject : function(projectName, initContent, eclipseSupport){},
		
		/* Resource tree model methods */
		newItem: function(/* Object? */ args, /*Item?*/ parent){},
		
		pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy){},
		
		
		onChange: function(/*dojo.data.Item*/ item){},
		
		onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){},
		
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
		
		destroy: function(){},
			
		mayHaveChildren: function(/*dojo.data.Item*/ item){},
		getRoot: function(onComplete){},
		
		getWorkspace : function(){},
		
		getChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete){},
		
		copy: function(sourceFile, destFile, recurse){},

		download: function(files,archiveName, root, userLibs){},
		
		findResource: function(name, ignoreCase, inFolder, workspaceOnly){}
	});
	
});

dojo.provide("davinci.model.Resource");

dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dijit.Tree");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.form.FileUploader");
dojo.require("davinci.Runtime");
dojo.require("davinci.model.Model");

   
dojo.mixin(davinci.model.Resource,	{

	root:null,
	
	__CASE_SENSITIVE:false,
	
	
	workspaceChanged : function(){
		delete this.root;
		this.getRoot();
		dojo.publish("/davinci/resource/workspaceChanged");
	},
	
	copy : function(sourceFile, destFile, recurse){
		var path = sourceFile.getPath? sourceFile.getPath() : sourceFile;
		var destPath = destFile.getPath? destFile.getPath() : destFile;
		var response = davinci.Runtime.serverJSONRequest({
			url:"./cmd/copy", 
			handleAs:"text", 
			sync:true,
			content:{'source':path, 'dest' : destPath, 'recurse': new String(recurse)}  });
		this.workspaceChanged();
	},

	download : function(files,archiveName){
		
		/* using a servlet to create the file on the fly from the request, 
		   this will eliminate delay from download click to actual start
		*/
		window.location.href= "./cmd/download?fileName=" + archiveName + "&resources="+escape(dojo.toJson(files));
	},
	
	getNewFileName : function (fileOrFolder, fileDialogParentFolder, extension){
		var existing, proposedName;
		var count=0;
		if(!extension){
			extension="";
		}
		do{
			count++;
			if(fileOrFolder==='newfolder'){
				proposedName='folder'+count;
			}else{
				proposedName='file'+count+extension;
			}
			var fullname=fileDialogParentFolder.getPath()+'/'+proposedName;
			existing=this.findResource(fullname);
		}while(existing);
		return proposedName;
	},
		
	/*
	 * Present new file or new folder dialog.
	 * @param action {string} newfile|newhtml|newcss|newjs|newfolder|openfile|saveas
	 */
	fileDialog : function(action){
		this.action=action;
		var dialogTitle;
		var fileNameLabel = "File name";
		var doItLabel = "Create";
		var doItAction = "davinci.model.Resource.createFile({checkForExtension:true})";
		var proposedFileName;
		var hideFileNameInput;
		var folder=davinci.model.Resource.getRoot();
		var resource=this.getSelectedResource();
		if (resource){
			folder=(resource.elementType=='Folder'?resource:resource.parent);
		}
		if(action==='newfile'){
			dialogTitle="Create New File";
			proposedFileName = "";
		}else if(action==='newhtml'){
			dialogTitle="Create New HTML File";
			proposedFileName = this.getNewFileName(action,folder,'.html');
		}else if(action==='newcss'){
			dialogTitle="Create New CSS File";
			proposedFileName = this.getNewFileName(action,folder,'.css');
		}else if(action==='newjs'){
			dialogTitle="Create New JavaScript File";
			proposedFileName = this.getNewFileName(action,folder,'.js');
		}else if(action==='openfile'){
			dialogTitle="Open File";
			proposedFileName = "";
			doItLabel = "Open";
			doItAction = "davinci.model.Resource.openFile()";
			hideFileNameInput = true;
		}else if(action==='newfolder'){
			dialogTitle="Create New Folder";
			fileNameLabel = "Folder name";
			proposedFileName = this.getNewFileName(action,folder);
			doItAction = "davinci.model.Resource.createFile({checkForExtension:false})";
		}else if(action==='saveas'){
			dialogTitle="Save File As";
			doItLabel = "Save";
			doItAction = "davinci.model.Resource.saveAs({checkForExtension:true})";
			var editor = davinci.Workbench.getOpenEditor();
			var file= editor.resourceFile || davinci.model.Resource.findResource( editor.fileName);
			folder=file.getParentFolder();
			var oldFileName = proposedFileName = file.getName();
			if(!oldFileName || !oldFileName===""){
				return;
			}
		}else{
			return;
		}
		this.fileOrFolder = (action==='newfolder')?'folder':'file';
		var formHtml = ''+
'<div class="fileDialog" style="position:relative">'+
'	<div id="fileDialogFileNameRow" class="fileNameRow">'+
'		<label for="fileDialogFileName">'+fileNameLabel+': </label>'+
'		<input dojoType="dijit.form.TextBox" type="text" name="fileDialogFileName" id="fileDialogFileName" value="'+proposedFileName+'"></input>'+
'	</div>'+
'	<div>'+
'		<label for="fileDialogParentFolder">Parent Folder: </label>'+
'	</div>'+
'	<div class="parentFolderInputRow"><input dojoType="dijit.form.TextBox" type="text" name="fileDialogParentFolder" id="fileDialogParentFolder"></input></div>'+
'	<div class="folderContainer">'+
'		<div dojoType="davinci.ui.widgets.ResourceTreeModel" foldersOnly="false" jsId="fileDialogFolderModel"></div>'+
'		<div dojoType="dijit.layout.ContentPane">'+
'			<div class="fileDialogTreeWidget" dojoType="dijit.Tree" id="fileDialogFolderTree" model="fileDialogFolderModel"></div>'+
'		</div>'+
'	</div>'+
'	<div class="buttonRow">'+
'		<button dojoType="dijit.form.Button" type="submit" onclick="'+doItAction+'; return false;">'+doItLabel+'</button>'+
'	</div>'+
'</div>'+
'';
		var	dialog = new dijit.Dialog({id: "fileDialog", title:dialogTitle,
			onCancel:function(){this.destroyRecursive(false);}});	
		
		dialog.setContent(formHtml);	
		dijit.byId('fileDialogFolderTree').set("selectedItems", [folder]);
		dijit.byId('fileDialogParentFolder').set('value',folder.getPath());
		dijit.byId('fileDialogFolderTree').notifySelect=function(item){
			if(item.elementType==='Folder'){
				dijit.byId('fileDialogParentFolder').set('value',item.getPath());
			}else{
				dijit.byId('fileDialogParentFolder').set('value',item.parent.getPath());
				dijit.byId('fileDialogFileName').set('value',item.name);
			}
		};		
		var connectHandle = dojo.connect(dojo.byId("fileDialog"), "onkeypress", function(e){
			if(e.charOrCode===dojo.keys.ENTER){
				eval(doItAction); 
				dojo.stopEvent(e);
			}
			dojo.disconnect(connectHandle);
		});
		dialog.show();
		if(hideFileNameInput){
			dojo.byId("fileDialogFileNameRow").style.display="none";
		}
	},
//
// add back in temporarily
//	openNewDialogue : function(){
	//
//			var folder=davinci.model.resource.getRoot();
//			var resource=this.getSelectedResource();
//			if (resource)
//			{
//				folder=(resource.elementType=='Folder'?resource:resource.parent);
//			}
	//
//			var data={
//					parentFolder:folder,
//					fileName : this.getNewFileName(),
//					fileOrFolder : 'isFile'
//					
//			};
//			davinci.ui.Panel.openDialog( {
//					definition : [ {
//							type : "text",
//							label : "Parent Folder:",
//							data : "parentFolder.name",
//							dataMember: name
//					}, 
//					{
//						type : "textBox",
//						label : "File Name:",
//						data : "fileName"
//					}, 
//					{
//		           		type: "radioButton",
//		           		data: "fileOrFolder",
//		           		sameLine: false,
//		           		values: "isFile,isFolder",
//		           		labels: "File,Folder"
//					}
//						],
//					data:data,
//					buttonLabel : 'Create',
//					onOK:	dojo.hitch(this,function ()
//					{
//						var folder=davinci.model.resource.getRoot();
//						var resource=this.getSelectedResource();
//						if (resource)
//						{
//							folder=(resource.elementType=='Folder'?resource:resource.parent);
//						}
//						else
//						{
//						  folder=davinci.model.resource.findResource(data.parentFolder.name);
//						}
//						var isFolder=data.fileOrFolder=='isFolder';
//						var fileName=data.fileName;
//						
//			
//						var file = folder.createResource(fileName,isFolder);
//						if (file && file.elementType=="File")
//						{
//							file.isNew=true;
//							davinci.Workbench.openEditor({fileName:file});
//						}
//					}),
//					title:"Create File or Folder"
//			});
//		},

	addFiles : function(){
		var formHtml = 
		'<label for=\"fileDialogParentFolder\">Parent Folder: </label><div id="fileDialogParentFolder" ></div>'+
        '<div id="btn0" class="browse">Select Files...</div><br/>'+
        '<textarea cols="50" rows="6" id="fileToUpload"></textarea><br/>'+
        '<div id="uploadBtn" class="uploadBtn" dojoType="dijit.form.Button">Upload</div><br/>';

		var	dialog = new dijit.Dialog({id: "addFiles", title:"Add Files",
			onCancel:function(){this.destroyRecursive(false);}});	
		
		dojo.connect(dialog, 'onLoad', function(){
			
			dojo.byId("fileToUpload").value = "";

			var folder=davinci.model.Resource.getRoot();
			var resource=davinci.model.Resource.getSelectedResource();
			if (resource)
			{
				folder=(resource.elementType=='Folder'?resource:resource.parent);
			}
//			dijit.byId('fileDialogParentFolder').set('value',folder.getPath());
			dojo.byId('fileDialogParentFolder').innerHTML=folder.getPath();

			var f0 = new dojox.form.FileUploader({
				degradable:true,
				uploadUrl:'./cmd/addFiles?path='+folder.getPath(), 
				uploadOnChange:false, 
				force:"html",
				selectMultipleFiles:true,
//				fileMask:fileMask,
				isDebug:true
//				,
//				postData:{sessionid:"TestStuff won't be sent", userId:"DojoMan"}
			}, "btn0");
			dojo.connect(dijit.byId("uploadBtn"),"onClick",function(){
				dojo.byId("fileToUpload").value = "uploading...";
				f0.upload();
			});
			
			dojo.connect(f0, "onChange", function(dataArray){
				dojo.forEach(dataArray, function(d){
					//file.type no workie from flash selection (Mac?)
						dojo.byId("fileToUpload").value += d.name+" "+Math.ceil(d.size*.001)+"kb \n";
				});
			});
			dojo.connect(f0, "onProgress", function(dataArray){
				dojo.forEach(dataArray, function(d){
					dojo.byId("fileToUpload").value += "onProgress: ("+d.percent+"%) "+d.name+" \n";
					
				});
			});
			dojo.connect(f0, "onComplete", function(dataArray){
				if (dataArray.length==1 && dataArray[0].length)
					dataArray=dataArray[0];
				totalFiles = dataArray.length;
				dojo.forEach(dataArray, function(d){
					dojo.byId("fileToUpload").value += "completed: "+d.file+" \n";
					folder.createResource(d.file,false,true);
				});
			});
			
		});
		dialog.setContent(formHtml);
		
		var folder=davinci.model.Resource.getRoot();
		var resource=this.getSelectedResource();
		if (resource)
		{
			folder=(resource.elementType=='Folder'?resource:resource.parent);
		}
		
		dialog.show();
	},
	
	_checkFileName : function(args){
		var dialog = dijit.byId("fileDialog");
		var resources=dijit.byId('fileDialogFolderTree').get("selectedItems");
		var resource = resources[0];
		var data = dialog.getValues();
		var fileName = data.fileDialogFileName;
		var folder=(resource.elementType=='Folder'?resource:resource.parent);
		var fullName=folder.getPath()+'/'+fileName;
		if(!fileName || fileName===""){
			alert("You must enter a file name.");
			return false;
		}
		var existing=this.findResource(fullName);
		if(existing){
			// Check if existing file is a folder
			if(existing.elementType=='Folder' && !args.selectFolderOK){
				alert("Cannot select "+fileName+". It is a folder.");
				return false;
			}
			if(args && args.existingFileOK){
				if(args.existingFileOK=="prompt"){
					if(!confirm("File "+fileName+" already exists. OK to overwrite?")){
						return false;
					}
				}
			}else{
				alert("Cannot create "+fileName+". Already exists.");
				return false;
			}
		}
		if(fileName.indexOf('/')>=0){
			alert("File names cannot contain a slash character (/). Your file name is: "+fileName);
			return false;
		}
		var newSplitName = fileName.split('.');
		if(args && args.checkForExtension && newSplitName.length<2){ // No extension, prompt user if OK
			if(!confirm("The name "+fileName+" does not have an extension (e.g., .html, .css or .js) and will be treated as a plain text file. OK to proceed?")){
				return false;
			}
		}
		return true;
	},

	createFile : function(args){
		if(!this._checkFileName(args)){
			return;
		}
		this._createFile(args);
	},

	_createFile : function(args){
		var newEditorCallback=(args&&args.newEditorCallback)?args.newEditorCallback:null;
		var dialog = dijit.byId("fileDialog");
		var resources=dijit.byId('fileDialogFolderTree').get("selectedItems");
		var resource = resources[0];
		var folder=(resource.elementType=='Folder'?resource:resource.parent);
		var data = dialog.getValues();
		dialog.hide();
		dialog.destroyRecursive(false);

		var isFolder = (this.fileOrFolder == 'folder');
		var fileDialogFileName = data.fileDialogFileName;

		var file = folder.createResource(fileDialogFileName, isFolder);
		if (file && file.elementType == "File") {
			file.isNew = true;
			davinci.Workbench.openEditor( {
				fileName : file,
				editorCreateCallback: newEditorCallback
			});
		}
	},

	openFile : function(args){
		if(!args){
			args={};
		}
		args.existingFileOK="noprompt";
		if(!this._checkFileName(args)){
			return;
		}
		var dialog = dijit.byId("fileDialog");
		var resources=dijit.byId('fileDialogFolderTree').get("selectedItems");
		var resource = resources[0];
		dialog.hide();
		dialog.destroyRecursive(false);
		
		if(resource.elementType=="File")
		{
			davinci.Workbench.openEditor({
				fileName: resource,
				content: resource.getContents()
			});
		}
	},

	saveAs : function(args){
		if(!args){
			args={};
		}
		args.existingFileOK="prompt";
		if(!this._checkFileName(args)){
			return;
		}
		var dialog = dijit.byId("fileDialog");
		var resources=dijit.byId('fileDialogFolderTree').get("selectedItems");
		var resource = resources[0];
		var data = dialog.getValues();
		var fileName = data.fileDialogFileName;
		var folder=(resource.elementType=='Folder'?resource:resource.parent);
		var fullName=folder.getPath()+'/'+fileName;
		var oldEditor = davinci.Workbench.getOpenEditor();
		var oldFileName = oldEditor.fileName;
		var oldResource = this.findResource(oldFileName);
		var oldContent = oldEditor.model.getText();

		// If resource exists, delete it because we will soon make a new version of that resource
		var existing=this.findResource(fullName);
		if(existing){
			existing.removeWorkingCopy();
			existing.deleteResource();
		}

		// Do various cleanups around currently open file
		oldResource.removeWorkingCopy();
		oldEditor.isDirty = false;
		oldEditor.editorContainer.forceClose(oldEditor);
		
		// Create a new editor for the new filename
		this._createFile({
			newEditorCallback:function(newEditor){
				// Because of async aspect to new file creation,
				// have to pass a callback function.
				// FIXME: The setTimeout here is a temporary kludge.
				// Doesn't work if called directly.
				// Undoubtedly fragile. Didn't work with 1ms timeout.
				setTimeout(function(){
					newEditor.saveAs(oldFileName, fullName,oldContent);
					newEditor.save();
				},1000);
			}
		});
	},

	deleteAction : function()
	{ 
		var resource=this.getSelectedResource();
		if (resource)
		{
		    if(confirm("Are you sure you want to delete "+resource.getPath()+"?")){
		    	return;
		    }
			resource.deleteResource();
		}else{
			alert("No resources are currently selected.");
		}
	},
	
	getRoot : function()
	{
	
		if (!this.root)
		{
			this.root=new davinci.model.Resource.Folder(".",null);
		}
		return this.root;
	},
	getSelectedResource: function()
	{
	  var selection=davinci.Runtime.getSelection();
	  if (selection[0]&&selection[0].resource)
		  return selection[0].resource;
	},
	getSelectedResources: function()
	{
	  var selection=davinci.Runtime.getSelection();
	  if (selection[0]&&selection[0].resource)
		  return dojo.map(selection,function(item){return item.resource});
	},
	
	/**
	 * @param name  Path of resource to find.  May include wildcard.
	 * @param ignoreCase
	 * @param inFolder  String or Resource object in which to start search.
	 * @returns  Resource
	 */
	findResource : function(name, ignoreCase, inFolder, workspaceOnly)
	{
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
		if (typeof name=='string')
	    {
			segments=name.split('/');
			if (segments[0]=='.')
				seg1=1;
	    }
		else if (name.getSegments)
        {
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
				if (!found)
				  return;
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
							if (!newResource)
								newResource= new davinci.model.Resource.Folder(name,loadResource);
							loadResource=newResource;
						}
						
					}
					var resource=this.root;
					seg1=0;
					segments=foundFile.file.split('/');
					if (segments[0]=='.')
						seg1=1;

					foundResources[i]=doFind();
				}
			}
		}
		else {
			foundResources[0]=found;
		}
		return isWildcard ? foundResources : foundResources[0];
	},
	alphabeticalSortFilter : {
	     filterList : function(list)
	    {
		    return list.sort(function (file1,file2)
		    	{return file1.name>file2.name ? 1 : file1.name<file2.name ? -1 : 0});
	    }
	
	},
	foldersFilter : {
	     filterItem : function(item)
	    {
		    if (item.elementType=='File')
		    	return true;
	    }
	}
});


/**  
 * @class davinci.model.Resource.Resource
   * @constructor 
   * @extends davinci.model.Model
 */
davinci.model.Resource.Resource= function(){
	this.inherits( davinci.model.Model);  
	this.elementType="Resource";
	this.name="";
	this.parent=null;
}

 davinci.Inherits(davinci.model.Resource.Resource,davinci.model.Model);
 davinci.model.Resource.Resource.prototype.getName= function(){
	 return this.name;
}
 
 davinci.model.Resource.Resource.prototype.getPath= function()
 {
	 if (this.parent)
		 return this.parent.getPath()+"/"+this.name;
	 return this.name;
 }
// davinci.model.Resource.Resource.prototype.getURL = function(){
//	
//    var locationPath=new davinci.model.Path(location.href);
//    var path=locationPath.getParentPath().append('wsfile').append(this.getPath()).toString();
//	 while(path.indexOf(".")==0 || path.indexOf("/")==0){
//		 path = path.substring(1,path.length);
//	 }
//
//    
//	 return path;
//	 
// }
 davinci.model.Resource.Resource.prototype.getURL = function(){
	 var path = this.getPath();
	 while(path.indexOf(".")==0 || path.indexOf("/")==0){
		 path = path.substring(1,path.length);
	 }
	    var loc=location.href;
	    if (loc.charAt(loc.length-1)=='/')
	    	loc=loc.substring(0,loc.length-1);

	 return loc+'/user/'+davinci.Runtime.userName+'/ws/workspace/'+ path;
	 
 }
 
 davinci.model.Resource.Resource.prototype.rename = function(newName, recurse){
		
		var path = new davinci.model.Path(this.getPath()).removeLastSegments();
		var newPath = path.append(newName);
		
		var response = davinci.Runtime.serverJSONRequest({url:"./cmd/rename", 
														  handleAs:"text", 
														  sync:true,
														  content:{'oldName':this.getPath(), 'newName' : newPath.toString()} 
															});
		this.name = newName;
		dojo.publish("/davinci/resource/resourceChanged",["renamed",this]);
	
	},
 
 davinci.model.Resource.Resource.prototype.getParentFolder = function(){
	 
	 if (this.elementType=="File")
		 return this.parent;
	 return this;
	 
 }
 davinci.model.Resource.Resource.prototype.visit= function(visitor,dontLoad){
	 var dontVisitChildren=visitor.visit(this);
	
	 if(!this._isLoaded && this.elementType=="Folder" && !dontLoad){
		this.getChildren(dojo.hitch(this,function(){ 
							dojo.forEach(this.children, function(child){child.visit(visitor,dontLoad)});
						 }));
	 }else if (this.children && !dontVisitChildren){
		 dojo.forEach(this.children, function(child){
			 child.visit(visitor,dontLoad);
		 });
	 }
 }
 

 davinci.model.Resource.Resource.prototype.deleteResource= function(localOnly)
 {
	 
	 var response="OK";
	 if (!localOnly) {
		 response = davinci.Runtime.serverJSONRequest({
		   url:"./cmd/deleteResource", handleAs:"text",
	          content:{'path':this.getPath()},sync:true  });
	 }
	  if (response=="OK")
	  {
		  var list=this.parent.children;
		  for(var i=0;i<list.length;i++)
			  if(this==list[i])
			  {
				  this.parent.children.splice(i, 1);
				  break;
			  }
			dojo.publish("/davinci/resource/resourceChanged",["deleted",this]);
	  }
	  else if (response!="OK")
		  alert(response);
 }
 
 /**  
  * @class davinci.model.Resource.Folder
    * @constructor 
    * @extends davinci.model.Resource.Resource
  */
 davinci.model.Resource.Folder= function(name,parent)
 {
 	this.inherits( davinci.model.Resource.Resource);  
 	this.elementType="Folder";
 	this.name=name;
 	this.parent=parent;
 }
  davinci.Inherits(davinci.model.Resource.Folder,davinci.model.Resource.Resource);

  davinci.model.Resource.Folder.prototype.createResource= function(name, isFolder, localOnly){
	 var file;
	 
	 if(name!=null){
		 file = isFolder ?   new davinci.model.Resource.Folder(name,this) :  new davinci.model.Resource.File(name,this);
  	 }else{
		 
		 file = this;
		 isFolder = this.elementType=="Folder";
	 }
	 
	 var response= (!localOnly) ? davinci.Runtime.serverJSONRequest({
		   url:"./cmd/createResource", handleAs:"text",
	       content:{'path':file.getPath(), 'isFolder': isFolder},sync:true  }): "OK";
	  if (response=="OK" && name!=null){
		  this.children.push(file);
		  dojo.publish("/davinci/resource/resourceChanged",["created",file]);
		  return file;
	  } else if (response!="OK"){
		  alert(response);
	  }else{
		  this.libraryId = this.libVersion = null;
		  return this;
	  }
	  
  }
  
  davinci.model.Resource.Folder.prototype.getChildren= function(onComplete,sync)
  {
	  if (!this._isLoaded)
	  {
		  if (this._loading)
		  {
			  this._loading.push(onComplete);
			  return;
		  }
		  this._loading=[];
		  this._loading.push(onComplete);
		  davinci.Runtime.serverJSONRequest({
			   url:"./cmd/listFiles",
		          content:{'path':this.getPath()},
		            sync:sync,
					load : dojo.hitch(this, function(responseObject, ioArgs) {
						this._addFiles(responseObject);
						dojo.forEach(this._loading,function(item){
							
							 (item)(this.children);
						},this);
						delete this._loading;
		            })
	  	  });
		  return;
	  }
      onComplete(this.children);
  }
  davinci.model.Resource.Folder.prototype._addFiles= function(responseObject)
  {
	
	  this.children=[];
		for (var i=0;i<responseObject.length;i++)
		{
			var child;
			if (responseObject[i].isDir || responseObject[i].isLib) {
			    child=new davinci.model.Resource.Folder(responseObject[i].name,this);
			    if (responseObject[i].isLib) {
			        child.isLibrary = true;
			    }
			} else {
				child=new davinci.model.Resource.File(responseObject[i].name,this);
			}
          
            child.link=responseObject[i].link;
            child.isNew = responseObject[i].isNew;
            child.readOnly = responseObject[i].readOnly;
            if(responseObject[i].libraryId){
            	child.libraryId = responseObject[i].libraryId;
            	child.libVersion = responseObject[i].libVersion;
            }
            
            this.children.push(child);
		}
		this._isLoaded=true;
	  
  }
  davinci.model.Resource.Folder.prototype.getMarkers= function(markerTypes,allChildren)
  {
	  var result=[];
	  this.visit({visit:function (resource){
		  if (resource.elementType=="File")
		  {
			  markers=resource.getMarkers(markerTypes);
			  result.concat(markers);
		  }
		  else if (!allChildren)
			  return true;
	  }},true);
	  return result;
  }

  davinci.model.Resource.Folder.prototype._getChild= function(name)
  {
	  if (!this.__CASE_SENSITIVE){
		  name=name.toLowerCase();
	  }
		for (var j=0;j<this.children.length;j++){
			if ( (this.__CASE_SENSITIVE && this.children[j].getName()==name) ||
				  (!this.__CASE_SENSITIVE && this.children[j].getName().toLowerCase()==name)  ){
			  return this.children[j];
		  }
		}
  }

  
  /**  
   * @class davinci.model.Resource.File
     * @constructor 
     * @extends davinci.model.Resource.Resource
   */
  davinci.model.Resource.File= function(name,parent)
  {
  	this.inherits( davinci.model.Resource.Resource);  
  	this.elementType="File";
  	this.name=name;
  	this.parent=parent;
   this.markers=[];
	this.extension=name.substr(name.lastIndexOf('.')+1);

  }
   davinci.Inherits(davinci.model.Resource.File,davinci.model.Resource.Resource);

   davinci.model.Resource.File.prototype.getExtension= function()
   {
   	return this.extension;
   }

   
   davinci.model.Resource.File.prototype.clearMarkers = function()
   {
	   this.markers=[];
   }

   davinci.model.Resource.File.prototype.addMarker = function(type,line,text)
   {
	   var marker=new davinci.model.Resource.Marker(this,type,line,text);
	   this.markers.push(marker);
   }

   davinci.model.Resource.File.prototype.getMarkers = function(markerTypes)
   {
	   var result=[];
	   if (this.markers)
		   for (var i=0;i<this.markers.length; i++)
		   {
			   var marker=this.markers[i];
			   if (!markerTypes)
				   result.push(marker);
				else if (typeof markerTypes == 'string')
				{ 
					if (marker.type==markerTypes)
					   result.push(marker);
				}
				else
					dojo.forEach(markerTypes,function (type){if (type==marker.type) result.push(marker)});
		   }
	   return result;
   }

   davinci.model.Resource.File.prototype.setContents = function(content, isWorkingCopy)
   {
	   var workingCopy=isWorkingCopy ? "true":"false";
	   if (this.isNew && !isWorkingCopy){
		   this.isNew=false;
	   }
		var path=encodeURIComponent(this.getPath());
		davinci.Runtime.serverPut(
				{
					url: "./cmd/saveFile?path="+path+"&isWorkingCopy="+workingCopy,
					putData: content,
					handleAs:"text",
					contentType:"text/html"
				});	
		dojo.publish("/davinci/resource/resourceChanged",["modified",this]);
   }

   davinci.model.Resource.File.prototype.getContents= function()
   {
 		  var contents=davinci.Runtime.serverJSONRequest({
 			   url:"./cmd/loadFile", handleAs:"text",
 		          content:{'path':this.getPath()}, sync:true
 	  	  });
 		  return contents;
   }


   davinci.model.Resource.File.prototype.removeWorkingCopy= function()
   {
 		 davinci.Runtime.serverJSONRequest({
 			   url:"./cmd/removeWorkingCopy", handleAs:"text",
 		          content:{'path':this.getPath()}, sync:true
 	  	  });
 		 if (this.isNew)
 			 this.deleteResource(true);
   }

   davinci.model.Resource.File.prototype.getFileInfo= function()
   {
 		  var fileInfo=davinci.Runtime.serverJSONRequest({
 			   url:"./cmd/getFileInfo", 
 		          content:{'path':this.getPath()}, sync:true
 	  	  });
 		  return fileInfo;
   }

   /**  
    * @class davinci.model.Resource.Marker
      * @constructor 
    */
   davinci.model.Resource.Marker= function(resource,type,line,text)
   {
   	this.resource=resource;
   	this.type=type;
   	this.line=line;
   	this.text=text;
   }
   

davinci.model.Resource.root=new davinci.model.Resource.Folder(".",null);

dojo.declare("davinci.model.resource.FileTypeFilter",null,{
	constructor : function(types)
	{
		this.types=types.split(",");
	},
    filterList : function(list)
    {
		var newList=[];
		for (var i=0;i<list.length;i++)
		{
			var resource=list[i];
			if (resource.elementType!="File")
				newList.push(resource);
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
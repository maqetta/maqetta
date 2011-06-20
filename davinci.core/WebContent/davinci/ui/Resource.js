dojo.provide("davinci.ui.Resource");

dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dijit.Tree");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.form.Uploader");
dojo.require("dojox.form.uploader.FileList");
dojo.require("dojox.form.uploader.plugins.HTML5");

dojo.mixin(davinci.ui.Resource, {
	/*
	 * Present new file or new folder dialog.
	 * @param action {string} newfile|newhtml|newcss|newjs|newfolder|openfile|saveas
	 */
	fileDialog : function(action){
		this.action=action;
		var dialogTitle;
		var fileNameLabel = "File name";
		var doItLabel = "Create";
		var doItAction = "davinci.ui.Resource.createFile({checkForExtension:true})";
		var proposedFileName;
		var hideFileNameInput;
		var folder=davinci.resource.getRoot();
		var resource=davinci.ui.Resource.getSelectedResource();
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
			doItAction = "davinci.ui.Resource.openFile()";
			hideFileNameInput = true;
		}else if(action==='newfolder'){
			dialogTitle="Create New Folder";
			fileNameLabel = "Folder name";
			proposedFileName = this.getNewFileName(action,folder);
			doItAction = "davinci.ui.Resource.createFile({checkForExtension:false})";
		}else if(action==='saveas'){
			dialogTitle="Save File As";
			doItLabel = "Save";
			doItAction = "davinci.ui.Resource.saveAs({checkForExtension:true})";
			var editor = davinci.Workbench.getOpenEditor();
			var file= editor.resourceFile || davinci.resource.findResource( editor.fileName);
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
		dijit.byId('fileDialogFolderTree').watch("selectedItem", function(prop, oldValue, newValue){
			if(newValue.elementType==='Folder'){
				dijit.byId('fileDialogParentFolder').set('value',newValue.getPath());
			}else{
				dijit.byId('fileDialogParentFolder').set('value',newValue.parent.getPath());
				dijit.byId('fileDialogFileName').set('value',newValue.name);
			}
		});
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
	addFiles : function(){
		var formHtml = 
		'<label for=\"fileDialogParentFolder\">Parent Folder: </label><div id="fileDialogParentFolder" ></div>'+
        '<div id="btn0"></div><br/>'+
        '<div id="filelist">'+
        '<div id="uploadBtn" class="uploadBtn" dojoType="dijit.form.Button">Upload</div><br/>';

		var	dialog = new dijit.Dialog({id: "addFiles", title:"Add Files",
			onCancel:function(){this.destroyRecursive(false);}});	
		
		dialog.connect(dialog, 'onLoad', function(){
			var folder=davinci.resource.getRoot();
			var resource=davinci.ui.Resource.getSelectedResource();
			if (resource)
			{
				folder=(resource.elementType=='Folder'?resource:resource.parent);
			}
//			dijit.byId('fileDialogParentFolder').set('value',folder.getPath());
			dojo.byId('fileDialogParentFolder').innerText=folder.getPath();

			var f0 = new dojox.form.Uploader({
				label: "Select Files...", // shouldn't need to localize this after Dojo 1.6
				url:'./cmd/addFiles?path='+folder.getPath(), 
				multiple:true
			});
			dojo.byId("btn0").appendChild(f0.domNode); // tried passing this into the constructor, but there's a bug that sizes the button wrong

			var list = new dojox.form.uploader.FileList({uploader:f0}, "filelist");

			var upload = dojo.connect(dijit.byId("uploadBtn"), "onClick", null, function(){ f0.upload(); });

			dojo.connect(f0, "onComplete", function(dataArray){
				dojo.forEach(dataArray, function(data){
					folder.createResource(data.file, false, true);
				});
				dojo.disconnect(upload);
				dojo.connect(dijit.byId("uploadBtn"), "onClick", null, function(){ dialog.destroyRecursive(false); });
				dojo.byId("uploadBtn").innerText="Done"; //TODO: i18n
			});
		});
		dialog.setContent(formHtml);
		
		var folder=davinci.resource.getRoot();
		var resource=this.getSelectedResource();
		if (resource)
		{
			folder=(resource.elementType=='Folder'?resource:resource.parent);
		}
		
		dialog.show();
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
			existing=davinci.resource.findResource(fullname);
		}while(existing);
		return proposedName;
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
		var existing=davinci.resource.findResource(fullName);
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
		var oldResource = davinci.resource.findResource(oldFileName);
		var oldContent = oldEditor.model.getText();
		//dialog.close();
		dialog.destroyRecursive();
		// If resource exists, delete it because we will soon make a new version of that resource
		var existing=davinci.resource.findResource(fullName);
		if(existing){
			existing.removeWorkingCopy();
			existing.deleteResource();
		}

		// Do various cleanups around currently open file
		oldResource.removeWorkingCopy();
		oldEditor.isDirty = false;
		oldEditor.editorContainer.forceClose(oldEditor);
		
		// Create a new editor for the new filename
		var file = folder.createResource(fileName);
		var pageBuilder = davinci.ve.RebuildPage();
		var newText = pageBuilder.rebuildSource(oldContent, file);
		file.setContents(newText);
		
		davinci.Workbench.openEditor( {		'fileName' : file, 'content': newText		});
		
	},
	deleteAction : function()
	{ 
		var resource=this.getSelectedResource();
		if (resource)
		{
		    if(!confirm("Are you sure you want to delete "+resource.getPath()+"?")){
		    	return;
		    }
			resource.deleteResource();
		}else{
			alert("No resources are currently selected.");
		}
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
	}
	
	 
	
});
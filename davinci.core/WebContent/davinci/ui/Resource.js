dojo.provide("davinci.ui.Resource");


dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");

dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dijit.Tree");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.form.Uploader");
dojo.require("dojox.form.uploader.FileList");
dojo.require("dojox.form.uploader.plugins.HTML5");
dojo.require("davinci.ui.NewProject");

dojo.mixin(davinci.ui.Resource, {
	/*
	 * Present new file or new folder dialog.
	 * @param action {string} newfile|newhtml|newcss|newjs|newfolder|openfile|saveas
	 */
	fileDialog: function(action){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui"),
			dialogTitle,
			fileNameLabel = langObj.fileName,
			doItLabel = langObj.create,
			doItAction = "davinci.ui.Resource.createFile({checkForExtension:true})",
			proposedFileName,
			hideFileNameInput,
			folder=davinci.resource.getRoot(),
			resource=davinci.ui.Resource.getSelectedResource();
		this.action=action;
		if (resource){
			//FIXME: Not sure this is the best way to code this.
			//The code below filters out the Review* nodes from the Reviews palette
			//because Runtime's currentSelection might include entries from either the
			//Files palette or the Reviews palette. But we really shouldn't have one
			//common selection between the two, so maybe this can be fixed at a higher
			//level. Whatever, the following fix should be safe in the meantime.
			if(resource.elementType=='Folder'){
				folder = resource;
			}else if(resource.elementType=='File'){
				folder = resource.parent;
			}
		}
		switch(action){
		case 'newfile':
			dialogTitle=langObj.createNewFile;
			proposedFileName = "";
			break;
		case 'newhtml':
			dialogTitle=langObj.createNewHTMLFile;
			proposedFileName = this.getNewFileName(action,folder,'.html');
			break;
		case 'newcss':
			dialogTitle=langObj.createNewCSSFile;
			proposedFileName = this.getNewFileName(action,folder,'.css');
			break;
		case 'newjs':
			dialogTitle=langObj.createNewJSFile;
			proposedFileName = this.getNewFileName(action,folder,'.js');
			break;
		case 'openfile':
			dialogTitle=langObj.openFile;
			proposedFileName = "";
			doItLabel = langObj.open;
			doItAction = "davinci.ui.Resource.openFile()";
			hideFileNameInput = true;
			break;
		case 'newfolder':
			dialogTitle=langObj.createNewFolder;
			fileNameLabel = langObj.folderName;
			proposedFileName = this.getNewFileName(action,folder);
			doItAction = "davinci.ui.Resource.createFile({checkForExtension:false})";
			break;
		case 'saveas':
			dialogTitle=langObj.saveFileAs;
			doItLabel = langObj.save;
			doItAction = "davinci.ui.Resource.saveAs({checkForExtension:true})";
			var editor = davinci.Workbench.getOpenEditor();
			var file= editor.resourceFile || davinci.resource.findResource( editor.fileName);
			folder=file.getParentFolder();
			var oldFileName = proposedFileName = file.getName();
			if(!oldFileName || !oldFileName===""){
				return;
			}
			break;
		default:
			return;
		}
		this.fileOrFolder = action === 'newfolder' ? 'folder' : 'file';
		var formHtml = ''+
'<div class="fileDialog" style="position:relative">'+
'	<div id="fileDialogFileNameRow" class="fileNameRow">'+
'		<label for="fileDialogFileName">'+fileNameLabel+': </label>'+
'		<input dojoType="dijit.form.TextBox" type="text" name="fileDialogFileName" id="fileDialogFileName" value="'+proposedFileName+'"></input>'+
'	</div>'+
'	<div>'+
'		<label for="fileDialogParentFolder">'+ langObj.parentFolder +' </label>'+
'	</div>'+
'	<div class="parentFolderInputRow"><input dojoType="dijit.form.TextBox" type="text" name="fileDialogParentFolder" id="fileDialogParentFolder"></input></div>'+
'	<div class="folderContainer">'+

'		<div dojoType="dijit.layout.ContentPane">'+
'			<div class="fileDialogTreeWidget" dojoType="dijit.Tree" id="fileDialogFolderTree" model="davinci.resource" labelAttr="name" childrenAttrs="children"></div>'+
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
		
		var tree = dijit.byId('fileDialogFolderTree');
		tree.set("selectedItems", [folder]);
		dijit.byId('fileDialogParentFolder').set('value',folder.getPath());
		tree.watch("selectedItem", function(prop, oldValue, newValue){
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
	addFiles: function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var formHtml = 
		'<label for=\"fileDialogParentFolder\">'+ langObj.parentFolder +' </label><div id="fileDialogParentFolder" ></div>'+
        '<div id="btn0"></div><br/>'+
        '<div id="filelist">'+
        '<div id="uploadBtn" class="uploadBtn" dojoType="dijit.form.Button">'+ langObj.upload +'</div><br/>';

		var	dialog = new dijit.Dialog({id: "addFiles", title:langObj.addFiles,
			onCancel:function(){this.destroyRecursive(false);}});	
		
		dialog.connect(dialog, 'onLoad', function(){
			var folder=davinci.resource.getRoot();
			var resource=davinci.ui.Resource.getSelectedResource();
			if (resource)
			{
				folder = resource.elementType == 'Folder' ? resource : resource.parent;
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

			var uploadHandler, uploadBtn = dijit.byId("uploadBtn");
			uploadBtn.set("disabled", true);
			dojo.connect(f0, 'onClick', function(){
				if (uploadHandler) { dojo.disconnect(uploadHandler); }
				uploadHandler = dojo.connect(uploadBtn, "onClick", null, function(){ f0.set("disabled", true); f0.upload(); });
				if (uploadBtn.oldText) {
					uploadBtn.containerNode.innerText = uploadBtn.oldText;
				}
				uploadBtn.set("disabled", false);
			});

			var setDone = function(){
				f0.set("disabled", false);
				dojo.disconnect(uploadHandler);
				uploadHandler = dojo.connect(uploadBtn, "onClick", null, function(){ dialog.destroyRecursive(false); });
				uploadBtn.oldText = uploadBtn.containerNode.innerText;
				uploadBtn.containerNode.innerText = langObj.done;
			};

			dojo.connect(f0, "onComplete", function(dataArray){
				dojo.forEach(dataArray, function(data){
					
					/* 
					 * need to add to the client side without a server call, mimic the results of a server call
					 * private API call since this is all part of the resource package.
					 * 
					 *  */
					folder._appendFiles([{isDir:false, isLib:false, isNew:false,name:data.file}])
					var changed = new davinci.model.Path(folder.getPath()).append(data.file);
					davinci.resource.resourceChanged('updated', changed.toString());
				});
				setDone();
			});
			dojo.connect(f0, "onError", function(args){
				//FIXME: post error message
				console.error("Upload error: ", args);
				dialog.set("disabled", false);
				setDone();
			});
		});
		dialog.setContent(formHtml);
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
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dialog = dijit.byId("fileDialog");
	//	var resources=dijit.byId('fileDialogFolderTree').get("selectedItems");
		
		var resourcePath = dijit.byId('fileDialogParentFolder').get('value');
		
		var resource = davinci.resource.findResource(resourcePath);
		var data = dialog.getValues();
		var fileName = data.fileDialogFileName;
		var folder=(resource.elementType=='Folder'?resource:resource.parent);
		var fullName=folder.getPath()+'/'+fileName;
		if(!fileName || fileName===""){
			alert(langObj.mustEnterFileName);
			return false;
		}
		var existing=davinci.resource.findResource(fullName);
		if(existing){
			// Check if existing file is a folder
			if(existing.elementType=='Folder' && !args.selectFolderOK){
				alert(dojo.string.substitute(langObj.cannotSelect, [fileName]));
				return false;
			}
			if(args && args.existingFileOK){
				if(args.existingFileOK=="prompt"){
					if(!confirm(dojo.string.substitute(langObj.fileAlreadyExistsOverwrite, [fileName]))){
						return false;
					}
				}
			}else{
				alert(dojo.string.substitute(langObj.cannotCreate, [fileName]));
				return false;
			}
		}
		if(fileName.indexOf('/')>=0){
			alert(dojo.string.substitute(langObj.fileNameSlashCharacter, [fileName]));
			return false;
		}
		var newSplitName = fileName.split('.');
		if(args && args.checkForExtension && newSplitName.length<2){ // No extension, prompt user if OK
			if(!confirm(dojo.string.substitute(langObj.doesNotHaveExtension,[fileName]))){
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
        var oldContent = oldEditor.editorID == "davinci.html.CSSEditor" ? oldEditor.getText() : oldEditor.model.getText();
		//dialog.close();
		dialog.destroyRecursive();
		// If resource exists, delete it because we will soon make a new version of that resource
		var existing=davinci.resource.findResource(fullName);
		oldEditor.editorContainer.forceClose(oldEditor);
		if(existing){
			existing.removeWorkingCopy();
			existing.deleteResource();
		}

		// Do various cleanups around currently open file
		oldResource.removeWorkingCopy();
		oldEditor.isDirty = false;
		
		
		// Create a new editor for the new filename
		var file = folder.createResource(fileName);
		var pageBuilder = davinci.ve.RebuildPage();
		var newText = pageBuilder.rebuildSource(oldContent, file);
		file.setContents(newText);
		
		davinci.Workbench.openEditor({fileName: file, content: newText});
	},
	
	
	newProject : function(){
		var projectDialog = new davinci.ui.NewProject({}),
			langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
	    davinci.Workbench.showModal(projectDialog, langObj.newProject, 'height:160px;width: 250px');
	},
	
	
	deleteAction: function()
	{
		var selection = this.getSelectedResources(),
		    paths = selection.map(function(resource){ return resource.getPath(); }).join("\n\t"),

		    langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		if(!confirm(dojo.string.substitute(langObj.areYouSureDelete,[paths]))){
	    	return;
	    }

	    selection.forEach(function(resource){
			resource.deleteResource();
		});
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
				content: resource.getText()
			});
		}
	}
	
	 
	
});
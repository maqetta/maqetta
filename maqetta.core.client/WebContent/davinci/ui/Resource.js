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
dojo.require("davinci.ui.widgets.NewFile");
dojo.require("davinci.ui.widgets.NewFolder");
dojo.require("davinci.ui.widgets.OpenFile");
dojo.require("davinci.ui.widgets.NewHTMLFileOptions");

dojo.mixin(davinci.ui.Resource, {
	
	_createNewDialog : function(fileNameLabel, createLabel, type, dialogSpecificClass){
		var resource=davinci.ui.Resource.getSelectedResource();
		var folder = null;
		if(resource!=null){
			if(resource.elementType=="Folder"){
				folder = resource;
			}else{
				folder = resource.parent;
			}
				
		}else{
			var base = davinci.Runtime.getProject();
			var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
			
			if(prefs.webContentFolder!=null && prefs.webContentFolder!=""){
				var fullPath = new davinci.model.Path(davinci.Runtime.getProject()).append(prefs.webContentFolder);
				folder = system.resource.findResource(fullPath.toString());
				
			}else{
				folder= system.resource.findResource(davinci.Runtime.getProject());
			}
		}
		
		var proposedFileName = this.getNewFileName('file',folder,"." + type);
		var dialogOptions = {newFileName:proposedFileName,
							fileFieldLabel:fileNameLabel, 
							folderFieldLabel:"Parent Folder:",
							finishButtonLabel:createLabel,
							dialogSpecificClass:dialogSpecificClass};
		return new davinci.ui.widgets.NewFile(dialogOptions);
		
	},
	
	
	newHTML : function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dialogSpecificClass = "davinci.ui.widgets.NewHTMLFileOptions";
		var newDialog = davinci.ui.Resource._createNewDialog(langObj.fileName, langObj.create, "html", dialogSpecificClass);
		var executor = function(){
			if(!newDialog.cancel){
				var optionsWidget = newDialog.dialogSpecificWidget;
				var options = optionsWidget.getOptions();
				var resourcePath = newDialog.get('value');
				if(davinci.ui.Resource._checkFileName(resourcePath)){
					var resource = system.resource.createResource(resourcePath);
					var text = system.resource.createText("CSS", {resource:resource});
					if(text){
						resource.setText(text);
					}
					//FIXME: Pull from dialog values instead
					var newHtmlParams = {
						device:'iphone',
						flowlayout:'false'
					};
					davinci.ui.Resource.openResource(resource, newHtmlParams);
				}
			}
		}
		davinci.Workbench.showModal(newDialog, langObj.createNewHTMLFile, 'width: 300px; oppacity:0', executor);
	},
	
	newCSS : function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var newDialog = davinci.ui.Resource._createNewDialog(langObj.fileName, langObj.create, "css");
		var executor = function(){
			if(!newDialog.cancel){
				var resourcePath = newDialog.get('value');
				if(davinci.ui.Resource._checkFileName(resourcePath)){
					var resource = system.resource.createResource(resourcePath);
					var text = system.resource.createText("CSS", {resource:resource});
					if(text)
						resource.setText(text);
					davinci.ui.Resource.openResource(resource);
				}
			}
		}
		davinci.Workbench.showModal(newDialog, langObj.createNewCSSFile, 'height:290px;width: 300px; oppacity:0', executor);
	},
	
	newFolder : function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var resource=davinci.ui.Resource.getSelectedResource();
		var folder = null;
		if(resource!=null){
			if(resource.elementType=="folder"){
				folder = resource;
			}else{
				folder = resource.parent;
			}
				
		}else{
			folder = system.resource.findResource(davinci.Runtime.getProject());
		}
		
		var proposedFileName = this.getNewFileName('folder',folder);
		var dialogOptions = {newFileName:proposedFileName,
							fileFieldLabel:langObj.folderName, 
							folderFieldLabel:"Parent Folder:",
							root:folder,
							finishButtonLabel:"Create Folder" };
		
		var newFolderDialog =  new davinci.ui.widgets.NewFolder(dialogOptions);
		var executor = function(){
			if(!newFolderDialog.cancel){
				var resourcePath = newFolderDialog.get('value');
				if(davinci.ui.Resource._checkFileName(resourcePath)){
					system.resource.createResource(resourcePath,true);
				}
			}
		}
		
		davinci.Workbench.showModal(newFolderDialog, langObj.createNewFolder, 'height:115px;width: 300px; oppacity:0', executor);
	},
	
	saveAs : function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var newDialog = davinci.ui.Resource._createNewDialog(langObj.fileName, langObj.save, "html");
		var executor = function(){
			if(!newDialog.cancel){
				var resourcePath = newDialog.get('value');
				if(davinci.ui.Resource._checkFileName(resourcePath)){
					
					var oldEditor = davinci.Workbench.getOpenEditor();
					var oldFileName = oldEditor.fileName;
					var oldResource = system.resource.findResource(oldFileName);
			        var oldContent = oldEditor.editorID == "davinci.html.CSSEditor" ? oldEditor.getText() : oldEditor.model.getText();
					var existing=system.resource.findResource(resourcePath);
					oldEditor.editorContainer.forceClose(oldEditor);
					if(existing){
						existing.removeWorkingCopy();
						existing.deleteResource();
					}
					// Do various cleanups around currently open file
					oldResource.removeWorkingCopy();
					oldEditor.isDirty = false;
					// Create a new editor for the new filename
					var file = system.resource.createResource(resourcePath);
					var pageBuilder = davinci.ve.RebuildPage();
					var newText = pageBuilder.rebuildSource(oldContent, file);
					file.setContents(newText);
					davinci.Workbench.openEditor({fileName: file, content: newText});
				}
			}
		}
		davinci.Workbench.showModal(newDialog, langObj.saveFileAs, 'height:290px;width: 300px; oppacity:0', executor);
	},
	
	newJS : function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var newDialog = davinci.ui.Resource._createNewDialog(langObj.fileName, langObj.create, "js");
		var executor = function(){
			if(!newDialog.cancel){
				var resourcePath = newDialog.get('value');
				if(davinci.ui.Resource._checkFileName(resourcePath)){
					var resource = system.resource.createResource(resourcePath);
					var text = system.resource.createText("CSS", {resource:resource});
					if(text)
						resource.setText(text);
					davinci.ui.Resource.openResource(resource);
				}
			}
		}
		davinci.Workbench.showModal(newDialog, langObj.createNewJSFile, 'height:290px;width: 300px; oppacity:0', executor);
	},
	
	openFile: function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var resource=davinci.ui.Resource.getSelectedResource();
		var folder = null;
		if(resource!=null){
			if(resource.elementType=="Folder"){
				folder = resource;
			}else{
				folder = resource.parent;
			}
				
		}else{
			folder = system.resource.findResource(davinci.Runtime.getProject());
		}
		
		var dialogOptions = {finishButtonLabel:langObj.open };
		var openDialog = new davinci.ui.widgets.OpenFile(dialogOptions);
		
		var executor = function(){
			if(!openDialog.cancel){
				var resource = openDialog.get('value');
				davinci.ui.Resource.openResource(resource);
			}
		}
		davinci.Workbench.showModal(openDialog, langObj.openFile, 'height:260px;width: 300px; oppacity:0', executor);
	},
	
	
	addFiles: function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var formHtml = 
		'<label for=\"fileDialogParentFolder\">'+ langObj.parentFolder +' </label><div id="fileDialogParentFolder" ></div>'+
        '<div id="btn0"></div><br/>'+
        '<div id="filelist"></div>'+
        '<div id="uploadBtn" class="uploadBtn" dojoType="dijit.form.Button">'+ langObj.upload +'</div><br/>';

		var	dialog = new dijit.Dialog({id: "addFiles", title:langObj.addFiles,
			onCancel:function() { /*dialog.reset();*/ this.destroyRecursive(false); }
		});	
		
		dialog.connect(dialog, 'onLoad', function(){
			var folder=system.resource.getRoot();
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
			dojo.connect(f0, 'onChange', function (files) {
				if (uploadHandler) { dojo.disconnect(uploadHandler); }
				uploadHandler = dojo.connect(uploadBtn, "onClick", null, function(){ f0.set("disabled", true); f0.upload(); });
				if (uploadBtn.oldText) {
					uploadBtn.containerNode.innerText = uploadBtn.oldText;
				}
				uploadBtn.set("disabled", !files.length);
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
					system.resource.resourceChanged('updated', changed.toString());
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
			if(fileOrFolder==='folder'){
				proposedName='folder'+count;
			}else{
				proposedName='file'+count+extension;
			}
			var fullname=fileDialogParentFolder.getPath()+'/'+proposedName;
			existing=system.resource.findResource(fullname);
		}while(existing);
		return proposedName;
	},
	
	_checkFileName : function(fullPath){
		
		var resource = system.resource.findResource(fullPath);
		if(resource!=null){
			alert("File already exists!");
			return false;
		}
		
		
		return true;
		
	},
	
	newProject : function(){
		var projectDialog = new davinci.ui.NewProject({}),
			langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
	    davinci.Workbench.showModal(projectDialog, langObj.newProject, 'height:160px;width: 250px');
	},
	
	renameAction : function(){
		var selection = this.getSelectedResources();
	    if( selection.length!=1) return;
	    var resource = selection[0];
	    resource.parent.getChildren(function(parentChildren){
		    var invalid = [];

	    	for(var i=0;i<parentChildren.length;i++){
	  	    	invalid.push(parentChildren[i].name);
	  	    }
	    	var renameDialog = new davinci.ui.Rename({value:resource.name, invalid:invalid});
	  		davinci.Workbench.showModal(renameDialog, 'Rename To....', 'height:110px;width: 200px',function(){
	  			
	  			var cancel = renameDialog.attr("cancel");
	  			var newName = renameDialog.attr("value");
	  			if(!cancel){
		  			resource.rename(newName);

				}
	  		});	
	    },true);
		
	},
	
	
	deleteAction: function(){
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

	getSelectedResource: function(){
	  var selection=davinci.Runtime.getSelection();
	  if (selection[0]&&selection[0].resource)
		  return selection[0].resource;
	},
	getSelectedResources: function(){
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

	openPath : function(path,text){
		var options = {fileName:path};
		if(text)
			options.text = text;
		davinci.Workbench.openEditor(options);
	},
	
	openResource : function(resource, newHtmlParams){

		if(resource.elementType=="File"){
			davinci.Workbench.openEditor({
				fileName: resource,
				content: resource.getText()
			}, newHtmlParams);
		}
	}
	
	 
	
});
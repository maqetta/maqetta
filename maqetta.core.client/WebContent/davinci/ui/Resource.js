//FIXME: A bunch of hard-coded strings in here that need to be globalized
define(['dojo/_base/declare',
        'system/resource',
       '../model/Path',
       '../Runtime',
       '../Workbench',
       '../workbench/Preferences',
       '../ve/RebuildPage',
       './Rename',
       './widgets/NewHTMLFileOptions',
       './widgets/OpenFile',
       './widgets/NewFolder',
       './widgets/NewFile',
       './widgets/AddFiles',
       './NewProject',
       'dojox/form/uploader/FileList', 
       'dojox/form/Uploader',
       'davinci/ui/Dialog',
       'dojo/i18n!./nls/ui',
       'dojo/i18n!dijit/nls/common',
       'dijit/form/Button',
       'dojox/form/uploader/plugins/HTML5'
       
],function(declare, Resource, Path, Runtime,Workbench, Preferences, RebuildPage, Rename, NewHTMLFileOption, OpenFile, NewFolder, NewFile, AddFiles, NewProject, FileList, Uploader, Dialog, uiNLS, commonNLS){

var createNewDialog = function(fileNameLabel, createLabel, type, dialogSpecificClass, fileName, existingResource) {
	var resource=existingResource || getSelectedResource();
	var folder;
	if (resource) {
		if(resource.elementType=="Folder"){
			folder = resource;
		}else{
			folder = resource.parent;
		}
	}else{
		var base = Workbench.getProject();
		var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		
		if(prefs.webContentFolder!=null && prefs.webContentFolder!=""){
			var fullPath = new Path(Workbench.getProject()).append(prefs.webContentFolder);
			folder = Resource.findResource(fullPath.toString());
			
		}else{
			folder= Resource.findResource(Workbench.getProject());
		}
	}
	
	var proposedFileName = fileName || uiResource.getNewFileName('file',folder,"." + type);
	var dialogOptions = {newFileName:proposedFileName,
						fileFieldLabel:fileNameLabel, 
						folderFieldLabel:"Where:", // FIXME: i18n
						finishButtonLabel:createLabel,
						value: folder,
						dialogSpecificClass:dialogSpecificClass};
	return new NewFile(dialogOptions);
};


var checkFileName = function(fullPath) {
	var resource = Resource.findResource(fullPath);
	if(resource){
		alert("File already exists!");
	}

	return !resource;
};

var getSelectedResource = function(){
	return (uiResource.getSelectedResources() || [])[0];
};

var uiResource = {
		newHTML: function(){
				var dialogSpecificClass = "davinci/ui/widgets/NewHTMLFileOptions";
				var newDialog = createNewDialog(uiNLS.fileName, uiNLS.create, "html", dialogSpecificClass);
				var executor = function(){
					var teardown = true;
					if(!newDialog.cancel){
						var optionsWidget = newDialog.dialogSpecificWidget;
						var options = optionsWidget.getOptions();
						var resourcePath = newDialog.get('value');
						var check = checkFileName(resourcePath);
						if(check){
							var resource = Resource.createResource(resourcePath);
							resource.isNew = true;
							var text = Resource.createText("HTML", {resource:resource});
							if(text){
								resource.setText(text);
							}
							var device = options.device;
							if(device === 'desktop'){
								device = 'none';
							}
							var newHtmlParams = {
								device:device,
								flowlayout:(options.layout=='flow')+'',	// value need to be strings 'true' or 'false'
								theme: options.theme,
								themeSet:newDialog.dialogSpecificWidget._selectedThemeSet
							};
							uiResource.openResource(resource, newHtmlParams);
							Workbench.workbenchStateCustomPropSet('nhfo',options);
						} else {
							teardown = false;
						}
					}
					return teardown;
				};
				Workbench.showModal(newDialog, uiNLS.createNewHTMLFile, '', executor);
		},
	
		newCSS: function(){
			var newDialog = createNewDialog(uiNLS.fileName, uiNLS.create, "css");
			var executor = function(){
				var teardown = true;
				if(!newDialog.cancel){
					var resourcePath = newDialog.get('value');
					var check = checkFileName(resourcePath);
					if (check) {
						var resource = Resource.createResource(resourcePath);
						resource.isNew = true;
						var text = Resource.createText("CSS", {resource:resource});
						if(text)
							resource.setText(text);
						uiResource.openResource(resource);
					} else {
						teardown = false;
					}
				}
				return teardown;
			};
			Workbench.showModal(newDialog, uiNLS.createNewCSSFile, '', executor);
		},
	
		/* method to select a given resource in the explorer tree */
		
		selectResource : function(resource){
			
			var resourceTree = dijit.byId("resourceTree");
			//var path = new Path(resource.getPath()).removeFirstSegments(1);
			
			var path = [];
			for(var i=resource; i.parent; i = i.parent) {
				path.unshift(i);
			} 
			
			resourceTree.set('path', path);
		},
		
		newFolder: function(parentFolder, callback){
			var resource=parentFolder || getSelectedResource();
			var folder;
			if(resource){
				if(resource.elementType=="Folder"){
					folder = resource;
				}else{
					folder = resource.parent;
				}
			}else{
				var base = Workbench.getProject();
				var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
				
				if(prefs.webContentFolder!=null && prefs.webContentFolder!=""){
					var fullPath = new Path(Workbench.getProject()).append(prefs.webContentFolder);
					folder = Resource.findResource(fullPath.toString());
				}
				if(!folder) {
					folder = Resource.findResource(Workbench.getProject());
				}
			}
			
			var proposedFileName = uiResource.getNewFileName('folder',folder);
			var dialogOptions = {newFileName:proposedFileName,
								fileFieldLabel:uiNLS.folderName, 
								folderFieldLabel:"Parent Folder:", // FIXME: i18n
								root:folder,
								finishButtonLabel:"Create Folder" }; // FIXME: i18n
			
			var newFolderDialog =  new NewFolder(dialogOptions);
			var finished = false;
			var newFolder;
			var executor = function(){
				var teardown = true;
				if(!newFolderDialog.cancel){
					var resourcePath = newFolderDialog.get('value');
					var check = checkFileName(resourcePath);
					if (check) {
						newFolder= Resource.createResource(resourcePath,true);
					} else {
						teardown = false;
					}
				}
				if(callback) {
					callback(newFolder);
				}
				if(newFolder!=null)
					uiResource.selectResource(newFolder);
				return teardown;
			};
			
			Workbench.showModal(newFolderDialog, uiNLS.createNewFolder, '', executor);
		},
	
		/* close an editor editting given resource */
		closeEditor : function(resource){
			var oldEditor = Workbench.getOpenEditor(resource);
			if(oldEditor!=null)
				oldEditor.editorContainer.forceClose(oldEditor);
			/* return true if we closed an open editor */
			return (oldEditor !=null);
		},
		
		saveAs: function(extension){
			var oldEditor = Workbench.getOpenEditor();
			var oldFileName = oldEditor.fileName;
			
			var newFileName = (new Path(oldFileName)).lastSegment();
			var oldResource = Resource.findResource(oldFileName);
			
			var newDialog = createNewDialog(uiNLS.fileName, uiNLS.save, extension, null, newFileName, oldResource);
			var executor = function(){
				var teardown = true;
				if(!newDialog.cancel){
					var resourcePath = newDialog.get('value');
					var check = checkFileName(resourcePath);
					if (check) {
						var oldResource = Resource.findResource(oldFileName);
						var oldContent = "";
						if (oldEditor.editorID == "davinci.html.CSSEditor") {
							// this does some css formatting
							oldContent = oldEditor.getText();
						} else {
							oldContent = (oldEditor.model && oldEditor.model.getText) ? oldEditor.model.getText() : oldEditor.getText();
						}
						var existing=Resource.findResource(resourcePath);
						oldEditor.editorContainer.forceClose(oldEditor);
						if(existing){
							existing.removeWorkingCopy();
							existing.deleteResource();
						}
						// Do various cleanups around currently open file
						oldResource.removeWorkingCopy();
						oldEditor.isDirty = false;
						// Create a new editor for the new filename
						var file = Resource.createResource(resourcePath);
						var pageBuilder =new RebuildPage();
						var newText = pageBuilder.rebuildSource(oldContent, file);
						file.setContents(newText);
						Workbench.openEditor({fileName: file, content: newText});
					} else {
						teardown = false;
					}
				}
				return teardown;
			};
			Workbench.showModal(newDialog, uiNLS.saveFileAs, '', executor);
		},
	
		newJS: function(){
			var newDialog = createNewDialog(uiNLS.fileName, uiNLS.create, "js");
			var executor = function(){
				var teardown = true;
				if(!newDialog.cancel){
					var resourcePath = newDialog.get('value');
					var check = checkFileName(resourcePath);
					if (check) {
						var resource = Resource.createResource(resourcePath);
						resource.isNew = true;
						var text = Resource.createText("CSS", {resource:resource});
						if(text) {
							resource.setText(text);
						}
						uiResource.openResource(resource);
					} else {
						teardown = false;
					}
				}
				return teardown;
			};
			Workbench.showModal(newDialog, uiNLS.createNewJSFile, '', executor);
		},

		openFile: function(){
			var folder, resource = getSelectedResource()
			if(resource){
				if(resource.elementType=="Folder"){
					folder = resource;
				}else{
					folder = resource.parent;
				}
					
			}else{
				folder = Resource.findResource(Workbench.getProject());
			}
			
			var dialogOptions = {finishButtonLabel: uiNLS.open};
			var openDialog = new OpenFile(dialogOptions);
			
			var executor = function(){
				if(!openDialog.cancel){
					uiResource.openResource(openDialog.get('value'));
				}
				return true;
			};
			Workbench.showModal(openDialog, uiNLS.openFile, '', executor);
		},
	
	
		addFiles: function(){
			var addFiles = new AddFiles({selectedResource: getSelectedResource()});

			Workbench.showModal(addFiles, uiNLS.addFiles, '', null);
		},

		getNewFileName:function (fileOrFolder, fileDialogParentFolder, extension){
			
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
				existing=Resource.findResource(fullname);
			}while(existing);
			return proposedName;
		},

		canModify: function(item){
			return !item.readOnly();
		},
	
		newProject: function(){
			var projectDialog = new NewProject({});
		    Workbench.showModal(projectDialog, uiNLS.newProject, '');
		},
	
		renameAction: function(){
		
			var selection = uiResource.getSelectedResources();
		    if( selection.length!=1) {
		    	return;
		    }
		    var resource = selection[0];
		    resource.parent.getChildren(function(parentChildren){
			    var invalid = parentChildren.map(function(child) {
			    	return child.name;
			    });
	
		    	var renameDialog = new Rename({value:resource.name, invalid:invalid});
		  		Workbench.showModal(renameDialog, 'Rename To....', '', function(){ //FIXME: i18n
		  			var cancel = renameDialog.attr("cancel");
		  			var newName = renameDialog.attr("value");
		  			if(!cancel){
		  				var opened = uiResource.closeEditor(resource);
		  				resource.rename(newName);
			  			if(opened) uiResource.openResource(resource);
					}
		  			return true;
		  		});	
		    }, true);
		},
	
		getResourceIcon: function(item, opened){
			if (item.elementType == "Folder"){
				return opened ? "dijitFolderOpened" : "dijitFolderClosed";
			}
			if (item.elementType=="File"){
				var icon;
					fileType=item.getExtension();
					extension=Runtime.getExtension("davinci.fileType", function (extension){
						return extension.extension==fileType;
					});
				if (extension){
					icon=extension.iconClass;
				}
				return icon || "dijitLeaf";
			}
			return this.prototype.getIconClass(item, opened);
		},

		getResourceClass: function(item) {
			if (item.readOnly()) {
				return "readOnlyResource";
			}
		},
	
		deleteAction: function(){
			var selection = uiResource.getSelectedResources(),
			    paths = selection.map(function(resource){ return resource.getPath(); }).join("\n\t");

			if(!confirm(dojo.string.substitute(uiNLS.areYouSureDelete, [paths]))){
		    	return;
		    }
	
		    selection.forEach(function(resource){
		    	uiResource.closeEditor(resource);
		    	resource.deleteResource();
			});
		},

		getSelectedResources: function(){
		  var selection=Runtime.getSelection();
		  if (selection[0]&&selection[0].resource)
			  return dojo.map(selection,function(item){return item.resource;});
		},

		alphabeticalSortFilter:{
		     filterList: function(list){
			    return list.sort(function (file1,file2)
			    	{return file1.name>file2.name ? 1 : file1.name<file2.name ? -1 : 0;});
		    }
		
		},
	   foldersFilter: {
	     filterItem: function(item){
		    if (item.elementType=='File')
		    	return true;
	    }
	   },

		openPath: function(path,text){
			var options = {fileName:path};
			if(text)
				options.text = text;
			Workbench.openEditor(options);
		},
	
		openResource: function(resource, newHtmlParams){
	
			if(resource.elementType=="File"){
				Workbench.openEditor({
					fileName: resource,
					content: resource.getText()
				}, newHtmlParams);
			}
		}

	};

return dojo.setObject("davinci.ui.Resource", uiResource);
});
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
       './widgets/AddFilesZip',
       './NewProject',
       './Dialog',
       'dojo/i18n!./nls/ui',
       'davinci/Theme',
       'dijit/form/Button',
       'dojox/form/uploader/plugins/HTML5',      
       
],function(declare, Resource, Path, Runtime,Workbench, Preferences, RebuildPage, Rename, NewHTMLFileOption, OpenFile, NewFolder, NewFile, AddFiles, AddFilesZip, NewProject, Dialog, uiNLS, Theme){

var createNewDialog = function(fileNameLabel, createLabel, type, dialogSpecificClass, dialogSpecificClassOptions, fileName, existingResource, optionalMessage) {
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
						checkFileName: checkFileName,
						dialogSpecificClass:dialogSpecificClass,
						dialogSpecificClassOptions:dialogSpecificClassOptions,
	optionalMessage: optionalMessage
	};
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
		newHTMLDialogSpecificClass: "davinci/ui/widgets/NewHTMLFileOptions",
		
		newHTMLMobile: function(){
			this.newHTML({
				comptype:'mobile',
				title:uiNLS.createMobileApplication,
				dialogSpecificClassOptions:{ showDevices:true, showThemeSetsButton:true }
			});
		},
		newHTMLDesktop: function(){
			this.newHTML({ 
				comptype:'desktop',
				title:uiNLS.createDesktopApplication,
				dialogSpecificClassOptions:{ showDevices:false, showThemeSetsButton:true },
				device:'desktop'
			});
		},
		newHTMLSketchHiFi: function(){
			this.newHTML({
				comptype:'sketchhifi',
				title:uiNLS.createSketchHiFi,
				dialogSpecificClassOptions:{ showDevices:false, showThemeSetsButton:true },
				layout:'absolute', 
				theme:'claro'
			});
		},
		newHTMLSketchLoFi: function(){
			this.newHTML({ 
				comptype:'sketchlofi',
				title:uiNLS.createSketchLoFi,
				dialogSpecificClassOptions:{ showDevices:false, showThemeSetsButton:false },
				layout:'absolute', 
				theme:'Sketch' 
			});
		},

		newHTML: function(params){
			var dialogSpecificClass = this.newHTMLDialogSpecificClass;
			var dialogSpecificClassOptions = params ? params.dialogSpecificClassOptions : null;
			var newDialog = createNewDialog(uiNLS.fileName, uiNLS.create, "html", dialogSpecificClass, dialogSpecificClassOptions);

			var executor = function(){
				var optionsWidget, options;
				if(newDialog.dialogSpecificWidget){
					optionsWidget = newDialog.dialogSpecificWidget;
					options = optionsWidget.getOptions();
				}
				var resourcePath = newDialog.get('value');
				var resource = Resource.createResource(resourcePath);
				resource.isNew = true;
				resource.dirtyResource = true;
				var text = Resource.createText("HTML", {resource:resource});
				if(text){
					resource.setText(text);
				}
				var device = 'none';
				if(params  && params.dialogSpecificClassOptions && params.dialogSpecificClassOptions.showDevices){
					device = options ? options.device : 'none';
				}
				var flowLayout = (params && params.layout) ? params.layout : true;
				flowLayout = flowLayout+'';	// value need to be strings 'true' or 'false'
				var theme = (params && params.theme) ? params.theme : null;
				var themeSet = null;
				if(params  && params.dialogSpecificClassOptions && params.dialogSpecificClassOptions.showThemeSetsButton){
					theme = options ? options.theme : null;
					themeSet = newDialog.dialogSpecificWidget ? newDialog.dialogSpecificWidget._selectedThemeSet : null;
				}
				var newHtmlParams = {
					comptype:params.comptype,
					device:device,
					flowlayout:flowLayout,
					theme: theme,
					themeSet:themeSet
				};
				uiResource.openResource(resource, newHtmlParams);
				var allOptions = Workbench.workbenchStateCustomPropGet('nhfo');
				if(!allOptions){
					allOptions = {};
				}
				var projectName = Workbench.getActiveProject();
				allOptions[projectName] = options;
				Workbench.workbenchStateCustomPropSet('nhfo',allOptions);
			};
			Workbench.showModal(newDialog, params.title, '', executor, true);
		},
	
		newCSS: function(){
			var newDialog = createNewDialog(uiNLS.fileName, uiNLS.create, "css");
			var executor = function(){
				var resourcePath = newDialog.get('value');
				var resource = Resource.createResource(resourcePath);
				resource.isNew = true;
				var text = Resource.createText("CSS", {resource:resource});
				if(text)
					resource.setText(text);
				uiResource.openResource(resource);
			};
			Workbench.showModal(newDialog, uiNLS.createNewCSSFile, '', executor, true);
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
								folderFieldLabel:uiNLS.parentFolder,
								root:folder,
								finishButtonLabel:uiNLS.createFolder,
								checkFileName: checkFileName
			};
			
			var newFolderDialog =  new NewFolder(dialogOptions);
			var finished = false;
			var newFolder;
			var executor = function(){
				var resourcePath = newFolderDialog.get('value');
				newFolder= Resource.createResource(resourcePath,true);

				if(callback) {
					callback(newFolder);
				}
				if(newFolder!=null)
					uiResource.selectResource(newFolder);
			};
			
			Workbench.showModal(newFolderDialog, uiNLS.createNewFolder, '', executor, true);
		},
	
		/* close an editor editting given resource */
		closeEditor: function(resource,flush){
			var oldEditor = Workbench.getOpenEditor(resource);
			if(oldEditor!=null){
				if(flush) oldEditor.save();
				oldEditor.editorContainer.forceClose(oldEditor);
			}
			/* return true if we closed an open editor */
			return oldEditor != null;
		},
		save: function() {
			var editor = Workbench.getOpenEditor();
			if (editor) {
				// check if read only
				system.resource.findResourceAsync(editor.fileName).then(
					dojo.hitch(this, function(resource) {
						if (resource.readOnly()) {
							this.saveAs(resource.getExtension(), uiNLS.savingReadonlyFile);
						} else {
							editor.save();
						}
					})
				);
			}
		},

		saveAs: function(extension, optionalMessage){
			var oldEditor = Workbench.getOpenEditor();
			var oldFileName = oldEditor.fileName;
			
			var newFileName = new Path(oldFileName).lastSegment();
			var oldResource = Resource.findResource(oldFileName);
			
			var newDialog = createNewDialog(uiNLS.fileName, uiNLS.save, extension, null, null, newFileName, oldResource, optionalMessage);
			var executor = function(){
				var resourcePath = newDialog.get('value');
				var oldResource = Resource.findResource(oldFileName);
				var oldContent;
				var themeSet;
				var theme;
				
				if (oldEditor.editorID == "davinci.html.CSSEditor") {
					// this does some css formatting
					oldContent = oldEditor.getText();
				} else {
					oldContent = (oldEditor.model && oldEditor.model.getText) ? oldEditor.model.getText() : oldEditor.getText();
				}
				if (oldEditor.editorID == "davinci.ve.HTMLPageEditor") {
					themeSet = Theme.getThemeSet(oldEditor.visualEditor.context);
					theme = oldEditor.visualEditor.context.theme;
				}
				
				
				var existing=Resource.findResource(resourcePath);
				
				oldEditor.editorContainer.forceClose(oldEditor);
				if(existing){
					existing.removeWorkingCopy();
					existing.deleteResource();
				}
				// Do various cleanups around currently open file
				//oldResource.removeWorkingCopy(); // 2453 Factory will clean this up..
				oldEditor.isDirty = false;
				// Create a new editor for the new filename
				var file = Resource.createResource(resourcePath);
				new RebuildPage().rebuildSource(oldContent, file, theme, themeSet).then(function(newText) {
					file.setContents(newText).then(function(){
						Workbench.openEditor({fileName: file});
					});
				});
			};
			Workbench.showModal(newDialog, uiNLS.saveFileAs, '', executor);
		},
	
		newJS: function(){
			var newDialog = createNewDialog(uiNLS.fileName, uiNLS.create, "js");
			var executor = function(){
				var resourcePath = newDialog.get('value');
				var resource = Resource.createResource(resourcePath);
				resource.isNew = true;
				var text = Resource.createText("CSS", {resource:resource});
				if(text) {
					resource.setText(text);
				}
				uiResource.openResource(resource);
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
				uiResource.openResource(openDialog.get('value'));
			};
			Workbench.showModal(openDialog, uiNLS.openFile, {width: 350, height: 250}, executor, true);
		},

		addFiles: function(){
			var addFiles = new AddFiles({selectedResource: getSelectedResource()});

			Workbench.showModal(addFiles, uiNLS.addFiles, {width: 350}, null);
		},

		addFilesZip: function(){
			var addFiles = new AddFilesZip({selectedResource: getSelectedResource()});

			Workbench.showModal(addFiles, uiNLS.addFiles, {width: 350}, null);
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
			Workbench.showModal(projectDialog, uiNLS.newProject, {"min-width":'330px'}, null, true);
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
		  		Workbench.showModal(renameDialog, uiNLS.renameDialogTitle, '', function(){
		  			var cancel = renameDialog.attr("cancel");
		  			var newName = renameDialog.attr("value");
		  			if(!cancel){
		  				var opened = uiResource.closeEditor(resource,true);
		  				resource.rename(newName).then(function() {
				  			if (opened) {
				  				uiResource.openResource(resource);		  					
				  			}
		  				});
					}
		  			return true;
		  		}, true);	
		    }, true);
		},
	
		getResourceIcon: function(item, opened){
			var isReadOnly = item.readOnly();

			if (item.elementType == "Folder"){
				if (isReadOnly) {
					return opened ? "dijitFolderOpened maqettaReadonlyFolderOpened" : "dijitFolderClosed maqettaReadonlyFolderClosed";
				} else {
					return opened ? "dijitFolderOpened" : "dijitFolderClosed";
				}
			}

			if (item.elementType=="File"){
				var icon;
					fileType=item.getExtension();
					extension=Runtime.getExtension("davinci.fileType", function (extension){
						return extension.extension==fileType;
					});
				if (extension){
					icon=extension.iconClass;

					if (isReadOnly) {
						icon += "ReadOnly"
					}
				}

				if (!icon) {
					icon = "dijitLeaf";

					if (isReadOnly) {
						icon += " maqettaReadonlyFile";
					}
				}
				return icon;
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

			var confirmString = dojo.string.substitute(uiNLS.areYouSureDelete, [paths]);
			confirmString += "\n\n" + uiNLS.NoteOperationNotUndoable + "\n";
			if(!confirm(confirmString)){
		    	return;
		    }
	
		    selection.forEach(function(resource){
		    	uiResource.closeEditor(resource);
		    	resource.deleteResource();
			});
		},

		getSelectedResources: function(){
		  var selection=Runtime.getSelection();
		  if (selection[0]&&selection[0].resource) {
			  return dojo.map(selection,function(item){return item.resource;});
		  }
		},

		alphabeticalSortFilter:{
		     filterList: function(list){
			    return list.sort(function (file1,file2) {
			    	return file1.name > file2.name ? 1 : file1.name<file2.name ? -1 : 0;
			    });
		    }
		
		},
	   foldersFilter: {
	     filterItem: function (item) {
		    if (item.elementType=='File') {
		    	return true;
		    }
	    }
	   },

		openPath: function(path,text){
			var options = {fileName:path};
			if (text) {
				options.text = text;
			}
			Workbench.openEditor(options);
		},
	
		openResource: function(resource, newHtmlParams){
	
			if(resource.elementType == "File"){
				resource.getContent().then(function(content) {
					Workbench.openEditor({
						fileName: resource,
						content: content
					}, newHtmlParams);
				});
			}
		}

	};

return dojo.setObject("davinci.ui.Resource", uiResource);
});

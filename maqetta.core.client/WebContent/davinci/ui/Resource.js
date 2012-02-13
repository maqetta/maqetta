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
       './NewProject',
       'dojox/form/uploader/FileList', 
       'dojox/form/Uploader','dijit/Dialog',
       'dojo/i18n!./nls/ui',
       'dojo/i18n!dijit/nls/common',
       'dijit/form/Button','dijit/Tree',
       'dijit/form/TextBox',
       'dojox/form/uploader/plugins/HTML5'
       
],function(declare, Resource, Path, Runtime,Workbench, Preferences, RebuildPage, Rename, NewHTMLFileOption, OpenFile, NewFolder, NewFile, NewProject, FileList, Uploader, Dialog, uiNLS, commonNLS){

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
	var proposedFileName = null;
	
	if(fileName){
		proposedFileName = new dojo.Deferred();
		proposedFileName.resolve(fileName);
	} else{
		proposedFileName =  uiResource.getNewFileName('file',folder,"." + type);
		
	}
	
	var dialogOptions = {newFileName:proposedFileName,
						fileFieldLabel:fileNameLabel, 
						folderFieldLabel:"Where:", // FIXME: i18n
						finishButtonLabel:createLabel,
						value: folder,
						dialogSpecificClass:dialogSpecificClass};
	return new NewFile(dialogOptions);
};


var checkFileName = function(fullPath) {
	return Resource.findResource(fullPath).then(function(resource){
		if(resource){
			alert("File already exists!");
		}

		return !resource;	
	});
	
};

var getSelectedResource = function(){
	return (uiResource.getSelectedResources() || [])[0];
};

var uiResource = {
		newHTML: function(){
			
				var langObj = uiNLS;
				var dialogSpecificClass = "davinci/ui/widgets/NewHTMLFileOptions";
				var newDialog = createNewDialog(langObj.fileName, langObj.create, "html", dialogSpecificClass);
				var executor = function(){
					var teardown = true;
					if(!newDialog.cancel){
						var optionsWidget = newDialog.dialogSpecificWidget;
						var options = optionsWidget.getOptions();
						var resourcePath = newDialog.get('value');
						
						checkFileName(resourcePath).then(dojo.hitch(this,function(check){
							
							if(check){
								Resource.createResource(resourcePath).then(function(resource){
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
								});
							} else {
								teardown = false;
							}
						}));
					}
					return teardown;
				};
				Workbench.showModal(newDialog, langObj.createNewHTMLFile, '', executor);
		},
	
		newCSS: function(){
			var langObj = uiNLS;
			var newDialog = createNewDialog(langObj.fileName, langObj.create, "css");
			var executor = function(){
				var teardown = true;
				if(!newDialog.cancel){
					var resourcePath = newDialog.get('value');
					checkFileName(resourcePath).then(dojo.hitch(this,function(check){
						if (check) {
							Resource.createResource(resourcePath).then(function(resource){
								resource.isNew = true;
								var text = Resource.createText("CSS", {resource:resource});
								if(text)
									resource.setText(text);
								uiResource.openResource(resource);
							})
					
						} else {
							teardown = false;
						}
					}));
				}
				return teardown;
			};
			Workbench.showModal(newDialog, langObj.createNewCSSFile, '', executor);
		},
	
		newFolder: function(parentFolder, callback){
			
			var langObj = uiNLS;
			var resource=parentFolder || getSelectedResource();
			var folder = null;
			if(resource!=null){
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
				if(folder==null) {
					folder = Resource.findResource(Workbench.getProject());
				}
			}
			
			var proposedFileName = uiResource.getNewFileName('folder',folder);
			var dialogOptions = {newFileName:proposedFileName,
								fileFieldLabel:langObj.folderName, 
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
					checkFileName(resourcePath).then(function(check){
						if (check) {
							newFolder= Resource.createResource(resourcePath,true);
							if(callback) {
								dojo.when(newFolder, callback);
							}
						} else {
							teardown = false;
						}
					});
				}
				
				return teardown;
			};
			
			Workbench.showModal(newFolderDialog, langObj.createNewFolder, '', executor);
		},
	
		saveAs: function(extension){
			var langObj = uiNLS
			
			var oldEditor = Workbench.getOpenEditor();
			var oldFileName = oldEditor.fileName;
			
			var newFileName = (new Path(oldFileName)).lastSegment();
			var oldResource = Resource.findResource(oldFileName);
			
			var newDialog = createNewDialog(langObj.fileName, langObj.save, extension, null, newFileName, oldResource);
			var executor = function(){
				var teardown = true;
				if(!newDialog.cancel){
					var resourcePath = newDialog.get('value');
					checkFileName(resourcePath).then(dojo.hitch(this,function(check){
						if (check) {
							Resource.findResource(oldFileName).then(function(oldResource){
								var oldContent = oldEditor.editorID == "davinci.html.CSSEditor" ? oldEditor.getText() : oldEditor.model.getText();
								Resource.findResource(resourcePath).then(function(existing){
									if(existing){
										existing.removeWorkingCopy();
										existing.deleteResource();
									}
								})
								oldEditor.editorContainer.forceClose(oldEditor);
								
								// Do various cleanups around currently open file
								oldResource.removeWorkingCopy();
								oldEditor.isDirty = false;
								// Create a new editor for the new filename
								Resource.createResource(resourcePath).then(function(file){
									var pageBuilder =new RebuildPage();
									var newText = pageBuilder.rebuildSource(oldContent, file);
									file.setContents(newText);
									Workbench.openEditor({fileName: file, content: newText});
								});
								
							});
					        
						} else {
							teardown = false;
						}
					}));
				}
				return teardown;
			};
			Workbench.showModal(newDialog, langObj.saveFileAs, '', executor);
		},
	
		newJS: function(){
			var langObj = uiNLS
			var newDialog = createNewDialog(langObj.fileName, langObj.create, "js");
			var executor = function(){
				var teardown = true;
				if(!newDialog.cancel){
					var resourcePath = newDialog.get('value');
					checkFileName(resourcePath).then(dojo.hitch(this,function(check){
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
					}));
				}
				return teardown;
			};
			Workbench.showModal(newDialog, langObj.createNewJSFile, '', executor);
		},
	
		openFile: function(){
			var langObj = uiNLS
			var resource=getSelectedResource();
			var folder = null;
			if(resource!=null){
				if(resource.elementType=="Folder"){
					folder = resource;
				}else{
					folder = resource.parent;
				}
					
			}else{
				folder = Resource.findResource(Workbench.getProject());
			}
			
			var dialogOptions = {finishButtonLabel:langObj.open };
			var openDialog = new OpenFile(dialogOptions);
			
			var executor = function(){
				if(!openDialog.cancel){
					uiResource.openResource(openDialog.get('value'));
				}
				return true;
			};
			Workbench.showModal(openDialog, langObj.openFile, '', executor);
		},
	
	
		addFiles: function(){
			var langObj = uiNLS;
			var formHtml = 
			'<label for=\"fileDialogParentFolder\">'+ langObj.parentFolder +' </label><div id="fileDialogParentFolder" ></div>'+
	        '<div id="btn0"></div><br/>'+
	        '<div id="filelist"></div>'+
	        '<div id="uploadBtn" class="uploadBtn" dojoType="dijit.form.Button">'+ langObj.upload +'</div><br/>';
	
			var	dialog = new Dialog({id: "addFiles", title:langObj.addFiles,
				onCancel:function() { /*dialog.reset();*/ this.destroyRecursive(false); }
			});	
			
			dialog.connect(dialog, 'onLoad', function(){
				var folder=Resource.getRoot();
				var resource=getSelectedResource();
				if (resource)
				{
					folder = resource.elementType == 'Folder' ? resource : resource.parent;
				}
	//			dijit.byId('fileDialogParentFolder').set('value',folder.getPath());
				dojo.byId('fileDialogParentFolder').innerText=folder.getPath();
	
				var f0 = new Uploader({
					label: "Select Files...", // shouldn't need to localize this after Dojo 1.6
					url:'cmd/addFiles?path='+folder.getPath(), 
					multiple:true
				});
	
				dojo.byId("btn0").appendChild(f0.domNode); // tried passing this into the constructor, but there's a bug that sizes the button wrong
	
				var list = new FileList({uploader:f0}, "filelist");
	
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
						folder._appendFiles([{isDir:false, isLib:false, isNew:false,name:data.file}]);
						var changed = new Path(folder.getPath()).append(data.file);
						Resource.resourceChanged('updated', changed.toString());
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
		getNewFileName:function (fileOrFolder, fileDialogParentFolder, extension){
			
			var existing, proposedName;
			var count=1;
			if(!extension){
				extension="";
			}
			
			function newName(){
				if(fileOrFolder==='folder'){
					return 'folder'+count;
				}else{
					return 'file'+count+extension;
				}	
			}
			
			function checkResource(resourcePath, name){
				var fullName = resourcePath + "/" + name;
					return Resource.findResource(fullName).then(function(res){
						if(!res){
							return true;
						}else{
							count++;
							return checkResource(resourcePath, newName());
						}
					})

			
			}
			
			return fileDialogParentFolder.then(function(res){
				
				return checkResource(res.getPath(),newName()).then(function(){
					return newName();
				});
			})
			
		},

		canModify: function(item){
			return !item.readOnly();
		},
	
		newProject: function(){
			var projectDialog = new NewProject({}),
				langObj = uiNLS;
		    Workbench.showModal(projectDialog, langObj.newProject, '');
		},
	
		renameAction: function(){
		
			var selection = uiResource.getSelectedResources();
		    if( selection.length!=1) return;
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
			  			resource.rename(newName);
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
			    paths = selection.map(function(resource){ return resource.getPath(); }).join("\n\t"),
	
			    langObj = uiNLS
			if(!confirm(dojo.string.substitute(langObj.areYouSureDelete,[paths]))){
		    	return;
		    }
	
		    selection.forEach(function(resource){
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
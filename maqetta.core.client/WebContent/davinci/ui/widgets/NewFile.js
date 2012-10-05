define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "davinci/Workbench",
        "system/resource",
        "davinci/workbench/Preferences",
        "davinci/Runtime",
        "dijit/Menu",
        "dijit/MenuItem",
        "davinci/model/Path",
        "dijit/form/DropDownButton",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/NewFile.html",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dijit/form/RadioButton"

],function(declare, _Templated, _Widget,  Library, Workbench, Resource,  Preferences, Runtime,  Menu, MenuItem, Path, DropDownButton, uiNLS, commonNLS, templateString){
	return declare("davinci.ui.widgets.NewFile",   [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: templateString,
		treeCollapsed:true,
	
		fileDialogFileName : null,
		fileTree : null,
		__okButton : null,
		dialogSpecificClass : null,
		_fileDialog : null,
		
		postMixInProperties : function() {
			var langObj = this.langObj = uiNLS;
			var dijitLangObj = commonNLS;
			dojo.mixin(this, langObj);
			dojo.mixin(this, dijitLangObj);
			this.inherited(arguments);
		},
		
		postCreate : function(){
			this.inherited(arguments);

			this.arrowNode = this.fileDialogDetailsArrow;
			
			this._tree_collapse_expand();
			var t = this;

			if(this.dialogSpecificClass){
				require([this.dialogSpecificClass],function(c){
					t.dialogSpecificWidget = new c(
							{dialogSpecificButtonsSpan:t.dialogSpecificButtonsSpan, dialogSpecificClassOptions:this.dialogSpecificClassOptions}, 
							t.dialogSpecificOptionsDiv);
				}.bind(this));	
			}

			this._whereMenu = new Menu({style: "display: none;"});
			this._whereDropDownButton = new DropDownButton({
				className: "whereDropDown",
				dropDown: this._whereMenu,
				iconClass: "fileDialogWhereIcon"
			});

			this.fileDialogWhereDropDownCell.appendChild(this._whereDropDownButton.domNode);
			
			// If current folder or any ancestor folders are read-only, then force the folder to the root folder
			var resource = this.value;
			while(resource){
				if(resource.readOnly()){
					this.value = null;
					break;
				}
				resource = resource.parent;
			}
			if(!this.value){
				this._setValueAttr(this._getForcedRootAttr());
			}
			
			this.connect(this.arrowNode, 'onclick', dojo.hitch(this,function(e){
				this._tree_collapse_expand(!this.treeCollapsed);
			}));
			dojo.connect(this.fileDialogFileName, "onkeyup", this, '_checkValid');
			this.fileTree.watch("selectedItem", dojo.hitch(this, this._updateFields));

			/* set initial value */
			
			this.fileTree.watch("selectedItem", dojo.hitch(this, this._checkValid));
                                                             
			this._updateFields();

			this.__okButton.onClick = dojo.hitch(this, this._okButton);

			// optionalMessage
			if (this.optionalMessage) {
				this.additionalMessage.innerHTML = this.optionalMessage;
				this.additionalMessage.style.display = "block";
			}
		},
		
		startup: function(){
			if(this.dialogSpecificWidget && this.dialogSpecificWidget.startup){
				this.dialogSpecificWidget.startup();
			}
		},
	
		/**
		 * Update this.collapsed to the given value and add/remove classes in DOM tree
		 * @param {boolean} treeCollapsed  New value for treeCollapsed
		 */
		_tree_collapse_expand: function(treeCollapsed){
			if(typeof treeCollapsed != 'undefined'){
				this.treeCollapsed = treeCollapsed;
			}
			var table = dojo.query('.fileFolderTable',this.domNode)[0];
			var folderContainer = dojo.query('.folderContainer',this.domNode)[0];
			var showSpan = dojo.query('.folder_details_show_arrow',this.domNode)[0];
			var hideSpan = dojo.query('.folder_details_hide_arrow',this.domNode)[0];
			if(table){
				if(this.treeCollapsed){
					dojo.addClass(table, 'treeCollapsed');
					dojo.removeClass(table, 'treeExpanded');
					dojo.addClass(folderContainer, 'dijitHidden');
					dojo.removeClass(showSpan, 'dijitHidden');
					dojo.addClass(hideSpan, 'dijitHidden');
				}else{
					dojo.addClass(table, 'treeExpanded');
					dojo.removeClass(table, 'treeCollapsed');
					dojo.removeClass(folderContainer, 'dijitHidden');
					dojo.addClass(showSpan, 'dijitHidden');
					dojo.removeClass(hideSpan, 'dijitHidden');
				}
			}
			this.fileDialogDetailsArrow.title = this.treeCollapsed ? this.langObj.newFileShowFiles : this.langObj.newFileHideFiles;
		},	
		
		_setValueAttr: function(value){
			/* full resource expected */
			if (value==this._value) {
				return;
			}
			this._value = value;
			var path = [];
			for(var i=value; i.parent; i = i.parent) {
				path.unshift(i);
			}
			return this.fileTree.set("path", path);
		},
		
		_setNewFileNameAttr: function(name){
			this.fileDialogFileName.set('value', name);
		},
		
		_getForcedRootAttr: function(){
			
			if(this._forcedRoot) {
				return this._forcedRoot;
			}
			
			var base = Workbench.getProject();
			var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
			
			if(prefs.webContentFolder!=null && prefs.webContentFolder!=""){
				var fullPath = new Path(Workbench.getProject()).append(prefs.webContentFolder);
				
				var folder = Resource.findResource(fullPath.toString());
				return folder;
			}
			return Resource.findResource(Workbench.getProject());
		},
		
		_setForcedRootAttr : function(value){
			this._forcedRoot = value;
		},
		
		_updateFields : function(){
			
			var resources = this.fileTree.get('selectedItems');
			var resource = (resources!=null && resources.length > 0)? resources[0] : null;
			var folderResource;
			var projectNameLength = ("./" + Workbench.getProject()).length + 1;
			if(resource==null){
				folderResource = this._getForcedRootAttr();
			}else if(resource.elementType=="Folder"){
				folderResource = resource;
			}else{
				this.fileDialogFileName.set( 'value', resource.getName());
				folderResource = resource.parent;
			}
			if(this._whereDropDownButton && this._whereMenu){
				var folderPathString = folderResource.getPath().substring(projectNameLength);
				var folderNameString = folderResource.getName();
				var trimmed = dojo.trim(folderPathString);
				var whereValue = trimmed.length==0 ? this.langObj.root : folderNameString;
		        this._whereDropDownButton.attr( 'label', whereValue);
		        this._whereMenu.attr( 'value', folderPathString);
				this._whereMenu.destroyDescendants();
				var menuItem;
				var done = false;
				var infiniteLoopCheck = 0;	// Just being paranoid about some weird case where done is never true
				do{
					var trimmed = dojo.trim(folderPathString);
					if(trimmed.length == 0){
						done = true;
						folderNameString = this.langObj.root;
					}
					menuItem = new MenuItem({label: folderNameString, value: folderPathString, onClick:dojo.hitch(this, function(label, value, e){
						this._whereMenu.attr('value', value);
						this._whereDropDownButton.attr( 'label', label);
						var folderPath = new Path(Workbench.getProject()).append(value);
						var folder = Resource.findResource(folderPath.toString());
						this.fileTree.set("selectedItems", [folder]);
					}, folderNameString, folderPathString)});
					this._whereMenu.addChild(menuItem);
					if(!done){
						folderResource = folderResource.parent;
						folderPathString = folderResource.getPath().substring(projectNameLength);
						folderNameString = folderResource.getName();
					}
					infiniteLoopCheck++;
				} while(!done && infiniteLoopCheck < 100);
			}
		},
		
		_checkValid: function() {
			// make sure the project name is OK.
			var name = this.fileDialogFileName.get('value'),
				valid = name && name.length > 0,
				folderName = this._whereMenu.attr('value'),
				parent = Resource.findResource(Workbench.getProject() + 
						(folderName ? '/' + folderName : '')),
				resource;
			if (parent) {
				valid = valid && !parent.readOnly();
			}
			
			resource = parent.getChildSync(name);
			if (resource) {
				valid = valid && !resource.readOnly();
			}
			
			this.__okButton.set('disabled', !valid);
			return valid;
		},             
		
		_okButton : function(e){
			var fullPath = (new Path(Workbench.getProject())).append(this._whereMenu.attr('value')).append(this.fileDialogFileName.get( 'value'));
			
			this.value = fullPath.toString();

			var check = this.checkFileName(this.value);
			if (check) {
				return true
			} else {
				return false;
			}
		},
			
		_newFolder : function(){
			var resources = this.fileTree.get('selectedItems');
			var resource = (resources!=null && resources.length > 0)? resources[0] : null;
			
			davinci.ui.Resource.newFolder(resource, dojo.hitch(this,function(newFolder){
				this.fileTree.set("selectedItems", [newFolder]);
			}));
			
		},
		
		_getValueAttr : function(){
			return this.value;
		},
		
		cancelButton: function(){
			this.onClose();
		},
		
		_createResource : function(){
			var folderName = this._whereMenu.attr('value');
			var fileName = this.fileDialogFileName.get( 'value');
			var resource = Resource.findResource(folderName + "/" + fileName);
			if(resource) return resource;
			var folder = Resource.findResource(folderName);
			return folder.createResource(fileName);
		},
		
		onClose : function(){}
	
	});
});

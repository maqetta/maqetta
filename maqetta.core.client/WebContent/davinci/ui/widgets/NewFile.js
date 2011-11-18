dojo.provide("davinci.ui.widgets.NewFile");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");
dojo.require("dojox.widget.Standby");

dojo.declare("davinci.ui.widgets.NewFile",   [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.ui.widgets", "templates/NewFile.html"),
	treeCollapsed:true,

	fileDialogFileName : null,
	fileDialogParentFolder: null,
	fileTree : null,
	__okButton : null,
	dialogSpecificClass : null,
	_fileDialog : null, 
	
	postMixInProperties : function() {
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
		dojo.mixin(this, langObj);
		dojo.mixin(this, dijitLangObj);
		this.cancel =true;
		this.inherited(arguments);
	},
	
	postCreate : function(){
		this.inherited(arguments);
		this.langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		dojo.connect(this.fileDialogFileName, "onkeyup", this, '_checkValid');
		dojo.connect(this.fileDialogParentFolder, "onkeyup", this, '_checkValid');
		this.fileTree.watch("selectedItem", dojo.hitch(this, this._updateFields));
		
		/* set a default value */
		if(!this._value){
			this._setValueAttr(this._getForcedRootAttr());
		}
		this.fileTree.watch("selectedItem", dojo.hitch(this, this._checkValid));
		
		this.arrowNode = dojo.query('.folder_details_arrow',this.domNode)[0];
		this.connect(this.arrowNode, 'onclick', dojo.hitch(this,function(e){
			this._tree_collapse_expand(!this.treeCollapsed);
		}));
		this._tree_collapse_expand();
		
		if(this.dialogSpecificClass){
			var c = dojo.getObject(this.dialogSpecificClass);
			this.dialogSpecificWidget = new c({}, this.dialogSpecificOptionsDiv);
		}
		

		var connectHandle = dojo.connect(this._fileDialog, "onkeypress", this, function(e){
			if(e.charOrCode===dojo.keys.ENTER){
				if(this._checkValid()){
					dojo.disconnect(connectHandle);
					dojo.stopEvent(e);
					this._okButton();
				}
			}
		
		});
		
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
	
	_setValueAttr : function(value){
		/* full resource expected */
		if(value==this._value) return;
		this._value = value;
		this.fileTree.set("selectedItems", [value]);
	},
	
	_setNewFileNameAttr : function(name){
		this.fileDialogFileName.set( 'value', name);
	},
	
	_getForcedRootAttr : function(){
		
		if(this._forcedRoot)
			return this._forcedRoot;
		
		var base = davinci.Runtime.getProject();
		var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		
		if(prefs.webContentFolder!=null && prefs.webContentFolder!=""){
			var fullPath = new davinci.model.Path(davinci.Runtime.getProject()).append(prefs.webContentFolder);
			
			var folder = system.resource.findResource(fullPath.toString());
			return folder;
		}
		return system.resource.findResource(davinci.Runtime.getProject());
	},
	
	_setForcedRootAttr : function(value){
		this._forcedRoot = value;
	},
	
	_updateFields : function(){
		
		var resources = this.fileTree.get('selectedItems');
		var resource = (resources!=null && resources.length > 0)? resources[0] : null;
		var projectNameLength = ("./" + davinci.Runtime.getProject()).length;
		if(resource==null){
			this.fileDialogParentFolder.set( 'value', this._getForcedRootAttr().getPath().substring(projectNameLength));
		}else if(resource.elementType=="Folder"){
			this.fileDialogParentFolder.set( 'value', resource.getPath().substring(projectNameLength));
		}else{
			this.fileDialogFileName.set( 'value', resource.getName());
			this.fileDialogParentFolder.set( 'value', resource.parent.getPath().substring(projectNameLength));
		}	
	},
	
	_checkValid : function(){
	
		// make sure the project name is OK.
		var name = dojo.attr(this.fileDialogFileName, "value");
		var valid = name!=null && name.length > 0;
		var parent = system.resource.findResource(this.fileDialogParentFolder.get('value'))
		if(parent!=null){
			valid = valid && !parent.readOnly();
		}
		
		var resource = system.resource.findResource( davinci.Runtime.getProject() + "/" + this.fileDialogParentFolder.get('value') + "/" + this.fileDialogFileName.get( 'value'));
	
		if(resource!=null){
			valid = valid && !resource.readOnly();
		}
		
		this.__okButton.set( 'disabled', !valid);
		return valid;
	},
	
	_okButton : function(){
		var fullPath = (new davinci.model.Path(davinci.Runtime.getProject())).append(this.fileDialogParentFolder.get('value')).append(this.fileDialogFileName.get( 'value'));
		
		this.value =  fullPath.toString();
		this.cancel = false;
		this.onClose();
		
	},
		
	_newFolder : function(){
		davinci.ui.Resource.newFolder();		
	},
	
	_getValueAttr : function(){
		return this.value;
	},
	
	cancelButton: function(){
		this.cancel = true;
		this.onClose();
	},
	
	_createResource : function(){
		var resource = system.resource.findResource(this.fileDialogParentFolder.get('value') + "/" + this.fileDialogFileName.get( 'value'));
		if(resource) return resource;
		var folder = system.resource.findResource(this.fileDialogParentFolder.get('value'));
		return folder.createResource(this.fileDialogFileName.get( 'value'));
	},
	onClose : function(){}


	


});
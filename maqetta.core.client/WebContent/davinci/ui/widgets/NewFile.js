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
	
	fileDialogFileName : null,
	fileDialogParentFolder: null,
	fileTree : null,
	
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
		dojo.connect(this.fileDialogFileName, "onkeyup", this, '_checkValid');
		this.fileTree.watch("selectedItem", dojo.hitch(this, this._updateFields));
		/* set a default value */
		if(!this._value){
			this._setValueAttr(this._getForcedRootAttr());
		}
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
		if(resource==null){
			this.fileDialogParentFolder.set( 'value', this._getForcedRootAttr().getName());
		}else if(resource.elementType=="Folder"){
			this.fileDialogParentFolder.set( 'value', resource.getPath());
		}else{
			this.fileDialogFileName.set( 'value', resource.getName());
			this.fileDialogParentFolder.set( 'value', resource.parent.getPath());
		}	
	},
	
	_checkValid : function(){
		// make sure the project name is OK.
		var name = dojo.attr(this.fileDialogFileName, "value");
		var valid = name!=null && name.length > 0;
		this._okButton.set( 'disabled', !valid);
	},
	_okButton : function(){
		this.value = this.fileDialogParentFolder.get('value') + "/" + this.fileDialogFileName.get( 'value');
		this.cancel = false;
		this.onClose();
		
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
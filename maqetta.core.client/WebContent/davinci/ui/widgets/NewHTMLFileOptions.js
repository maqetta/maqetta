dojo.provide("davinci.ui.widgets.NewHTMLFileOptions");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");  
dojo.require("dijit.form.Select");
/*
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");
dojo.require("dojox.widget.Standby");
*/

dojo.declare("davinci.ui.widgets.NewHTMLFileOptions",   [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.ui.widgets", "templates/NewHTMLFileOptions.html"),
	compositionType: null,
	device:null,
	canvasSize: null,
	layoutMode: null,
	themeSet: null,
	
/*
	fileDialogFileName : null,
	fileDialogParentFolder: null,
	fileTree : null,
	dialogSpecificOptions : null,
*/
	
	postMixInProperties : function() {
/*
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
		dojo.mixin(this, dijitLangObj);
		this.cancel =true;
*/
		this.inherited(arguments);
	},
	postCreate : function(){
		this.inherited(arguments);
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		this.compositionTypeLabel.innerHTML = langObj.compositionType;
		this.deviceLabel.innerHTML = langObj.device;
		this.sizeLabel.innerHTML = langObj.size;
		this.layoutLabel.innerHTML = langObj.layout;
		this.themeLabel.innerHTML = langObj.theme;
		
		//FIXME: Add logic for 'for' attributes point to correct id
		
		// Contained widgets are:
		// this.compositionTypeSelect
		// this.deviceSelect
		// need others


/*
		dojo.connect(this.fileDialogFileName, "onkeyup", this, '_checkValid');
		this.fileTree.watch("selectedItem", dojo.hitch(this, this._updateFields));
*/
		/* set a default value */
/*
		if(!this._value){
			this._setValueAttr(this._getForcedRootAttr());
		}
		//FIXME: Temporary
		this.dialogSpecificOptionsDiv.innerHTML = this.dialogSpecificOptions;
*/
	},
	
	
	_setValueAttr : function(value){
		/* full resource expected */
/*
		if(value==this._value) return;
		this._value = value;
		this.fileTree.set("selectedItems", [value]);
*/
	},
	
	_setNewFileNameAttr : function(name){
/*
		this.fileDialogFileName.set( 'value', name);
*/
	},
	
	_getForcedRootAttr : function(){
/*		
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
*/
	},
	
	_setForcedRootAttr : function(value){
/*
		this._forcedRoot = value;
*/
	},
	
	_updateFields : function(){
/*
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
*/
	},
	
	_checkValid : function(){
/*
		// make sure the project name is OK.
		var name = dojo.attr(this.fileDialogFileName, "value");
		var valid = name!=null && name.length > 0;
		this._okButton.set( 'disabled', !valid);
*/
	},
	_okButton : function(){
/*
		this.value = this.fileDialogParentFolder.get('value') + "/" + this.fileDialogFileName.get( 'value');
		this.cancel = false;
		this.onClose();
*/
	},
	
	_getValueAttr : function(){
/*
		return this.value;
*/
	},
	
	cancelButton: function(){
/*
		this.cancel = true;
		this.onClose();
*/
	},
	
	_createResource : function(){
/*
		var resource = system.resource.findResource(this.fileDialogParentFolder.get('value') + "/" + this.fileDialogFileName.get( 'value'));
		if(resource) return resource;
		var folder = system.resource.findResource(this.fileDialogParentFolder.get('value'));
		return folder.createResource(this.fileDialogFileName.get( 'value'));
*/
	},
	
	onClose : function(){},
	
	getOptions: function(){
		return{
			compositionType: this.compositionTypeSelect.attr('value'),
			device: this.deviceSelect.attr('value'),
			size: this.sizeSelect.attr('value'),
			layout: this.layoutSelect.attr('value'),
			theme: this.themeSelect.attr('value')
		};
	}

	
	


});
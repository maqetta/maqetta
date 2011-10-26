dojo.provide("davinci.ui.widgets.NewFolder");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");
dojo.require("dojox.widget.Standby");


dojo.declare("davinci.ui.widgets.NewFolder",   [dijit._Widget, dijit._Templated], {

	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.ui.widgets", "templates/NewFolder.html"),
	folderName : null,
	fileDialogParentFolder: null,

	okButton : null,
	
	postMixInProperties : function() {
		this.cancel =true;
		this.inherited(arguments);
	},
	postCreate : function(){
		this.inherited(arguments);
		dojo.connect(this.folderName, "onkeyup", this, '_checkValid');
		/* set a default value */
		if(!this._value){
			this._setRootAttr(this._getRootAttr());
		}
	},
	
	
	_setValueAttr : function(value){
		/* full resource expected */
		if(value==this._value) return;
		this._value = value;
		var parentFolder = "";
		if(value && value.elementType=="Folder"){
			this.fileDialogParentFolder.set(value.parent.getPath());
			this.fileDialogParentFolder.set(value.getName());
		}else if(value){
			this.fileDialogParentFolder.set(value.parent.getPath());
		}
		
		
	},
	
	_setNewFileNameAttr : function(name){
		this.folderName.set( 'value', name);
	},
	_getRootAttr : function(){
		return this._root || system.resource.findResource(davinci.Runtime.getProject());
	},
	
	_setRootAttr : function(value){
		this._root=value;
		this.fileDialogParentFolder.set('value', value.getPath());
		
	},
	_checkValid : function(){
		
		// make sure the project name is OK.
		var name = this.folderName.get( "value");
		var valid = name!=null && name.length > 0;
		this._okButton.set( 'disabled', !valid);
	},
	_okButton : function(){
		this.value = this.fileDialogParentFolder.get('value') + "/" + this.folderName.get( 'value');
		this.cancel = false;
		this.onClose();
		
	},
	
	_getValueAttr : function(){
		this.value = this.fileDialogParentFolder.get('value') + "/" + this.folderName.get( 'value');
		return this.value;
	},
	
	_cancelButton: function(){
		this.cancel = true;
		this.onClose();
	},
	
	_createResource : function(){
		var resource = system.resource.findResource(this.fileDialogParentFolder.get('value') + "/" + this.folderName.get( 'value'));
		if(resource) return resource;
		var folder = system.resource.findResource(this.fileDialogParentFolder.get('value'));
		return folder.createResource(this.folderName.get( 'value'));
	},
	onClose : function(){}


});
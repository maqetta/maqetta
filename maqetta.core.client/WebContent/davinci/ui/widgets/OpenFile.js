dojo.provide("davinci.ui.widgets.OpenFile");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Tree");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");

dojo.declare("davinci.ui.widgets.OpenFile",   [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.ui.widgets", "templates/OpenFile.html"),
	
	fileDialogFileName : null,
	fileDialogParentFolder: null,
	
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
	
		this.fileTree.watch("selectedItem", dojo.hitch(this, this._updateFields));
		/* set a default value */
		if(!this._value){
			this._setValueAttr(this._getForcedRootAttr());
		}
	},

	startup: function() {
		this.fileTree.startup();
	},
	
	_setValueAttr : function(value){
		/* full resource expected */
		if(value==this._value) return;
		this._value = value;
		this.fileTree.set("selectedItems", [value]);
	},
	

	
	_getForcedRootAttr : function(){
		return this._forcedRoot || system.resource.findResource(davinci.Runtime.getProject());
	},
	
	_setForcedRootAttr : function(value){
		this._forcedRoot = value;
	},
	
	_updateFields : function(){
		var resources = this.fileTree.get('selectedItems');
		var resource = (resources!=null && resources.length > 0)? resources[0] : null;
		dojo.attr(this._okButton, "disabled", true);
		if(resource!=null && resource.elementType=="File"){
			dojo.attr(this._okButton, "disabled", false);
		}	
	},
	

	_okButton : function(){
		var resources = this.fileTree.get('selectedItems');
		this.value = resources[0];
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
	
	onClose : function(){}
});
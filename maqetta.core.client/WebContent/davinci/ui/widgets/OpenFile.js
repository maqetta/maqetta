define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "system/resource",
        "davinci/workbench/Preferences",
        "davinci/Runtime",
        "dijit/Menu",
        "dijit/MenuItem",
        "davinci/model/Path",
        "dijit/form/DropDownButton",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/OpenFile.html",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dijit/form/RadioButton",
        "dijit/layout/ContentPane",
        "dijit/Tree"

],function(declare, _Templated, _Widget,  Library, Resource,  Preferences, Runtime,  Menu, MenuItem, Path, DropDownButton, uiNLS, commonNLS, templateString){
	return declare("davinci.ui.widgets.OpenFile",   [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: dojo.cache("davinci.ui.widgets", "templates/OpenFile.html"),
		
		fileDialogFileName : null,
		fileDialogParentFolder: null,
		
		postMixInProperties : function() {
			var langObj = uiNLS;
			var dijitLangObj = commonNLS;
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
			return this._forcedRoot || Resource.findResource(davinci.Runtime.getProject());
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
});
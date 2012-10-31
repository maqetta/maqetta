define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "system/resource",
        "davinci/workbench/Preferences",
        "davinci/Runtime",
        "davinci/Workbench",
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

],function(declare, _Templated, _Widget,  Library, Resource,  Preferences, Runtime,  Workbench, Menu, MenuItem, Path, DropDownButton, uiNLS, commonNLS, templateString){
	return declare("davinci.ui.widgets.OpenFile",   [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: dojo.cache("davinci.ui.widgets", "templates/OpenFile.html"),
		
		fileDialogFileName : null,
		fileDialogParentFolder: null,
		
		postMixInProperties: function() {
			dojo.mixin(this, uiNLS);
			dojo.mixin(this, commonNLS);
			this.inherited(arguments);
		},
		postCreate: function(){
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
		
		_setValueAttr: function(value){
			/* full resource expected */
			if(value==this._value) {
				return;
			}
			this._value = value;
			this.fileTree.set("selectedItems", [value]);
		},

		_getForcedRootAttr: function(){
			return this._forcedRoot || Resource.findResource(Workbench.getProject());
		},
		
		_setForcedRootAttr: function(value){
			this._forcedRoot = value;
		},
		
		_updateFields: function(){
			var resources = this.fileTree.get('selectedItems');
			var resource = (resources!=null && resources.length > 0)? resources[0] : null;
			dojo.attr(this._okButton, "disabled", true);
			if(resource!=null && resource.elementType=="File"){
				dojo.attr(this._okButton, "disabled", false);
			}	
		},

		_okButton: function(){
			var resources = this.fileTree.get('selectedItems');
			this.value = resources[0];
		},

		_onDblClick: function(item) {
			this._okButton();
			this.onExecute();
		},

		_onKeyPress: function(e) {
			if (e.which == dojo.keys.ENTER) {
				this._okButton();
				this.onExecute();
			}
		},
		
		_getValueAttr: function(){
			return this.value;
		},
		
		_cancelButton: function(){
			this.onClose();
		},

		resize: function(coords) {
			this.contentpane.resize(coords);
		},

		onExecute: function(){},
		
		onClose: function(){}
	});
});
define(["dojo/_base/declare",
				"dijit/_WidgetBase",
				"dijit/_TemplatedMixin",
				"dijit/_WidgetsInTemplateMixin",
        "davinci/Workbench",
        "dijit/Tree",
        "dijit/form/Button",
        "davinci/model/Path",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/FileFieldDialog.html",
        "dijit/form/TextBox",
   ],function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Workbench, Tree, Button, Path,  uiNLS, commonNLS, templateString){
	
var idPrefix = "davinci_ui_widgets_filefielddialog_generated";
var	__id=0;
var getId = function (){
	return idPrefix + (__id++);
};

return declare("davinci.ui.widgets.FileFieldDialog", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

	templateString: templateString,
	widgetsInTemplate: true,

	//Maintain set of connections for clean-up
	_connection: [],
	
	_fileSelectionDialog: null,

	_showFileSelectionDialog: function() {
		//Set-up file selection tree
		var treeParms= {  
			persist: false,
			style: "height:100%;overflow:auto;",
			model: system.resource,
			filters: "new system.resource.FileTypeFilter(parms.fileTypes || '*');" //See #1725
	    };
		var tree = new Tree(treeParms);
		
		//Set-up button
		var okClicked = function() {
			if (tree.selectedItem) {
				var selectedItemPathStr = tree.selectedItem.getPath();
				/* only relativize the path if the user used the file chooser */
				var path=new Path(selectedItemPathStr);
				var value=path.relativeTo(new Path(this._baseLocation), true).toString(); // ignore the filename to get the correct path to the image
				this.textField.set("value", value);
				this._onChange();
			}
		};

		Workbench.showDialog(uiNLS.selectFile, tree, {width: 275, height: 220}, dojo.hitch(this, okClicked));
	},
	
	_setBaseLocationAttr: function(baseLocation){
		// this is the directory to make everything relative to. also the first directory to show
		this._baseLocation = baseLocation;
	},
	
	_setValueAttr: function(value){
		 if(this.value!= value ){
			this.value = value;
			this.textField.set("value", value);
		 }
	},
	
	_onChange: function(){	
		var value = this.textField.get("value")
		
		if(this.value!=value){			
			this.value = value;
			this.textField.set('value', this.value);
			this.onChange(value);
		}
	},
	
	onChange: function(event){},
	
	_getValueAttr: function(){
		return this.textField.get("value");	
	},
	
	destroy: function() {
		//Clean-up connections
		while (connection = this._connection.pop()){
			dojo.disconnect(connection);
		}
	}
});
});
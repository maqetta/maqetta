define(["dojo/_base/declare",
        "davinci/workbench/WidgetLite",
        "dijit/Dialog",
        "dijit/Tree",
        "dijit/form/Button",
        "davinci/model/Path",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common"
   ],function(declare, WidgetLite, Dialog, Tree, Button, Path,  uiNLS, commonNLS){
	
var idPrefix = "davinci_ui_widgets_filefielddialog_generated";
var	__id=0;
var getId = function (){
	return idPrefix + (__id++);
};

return declare("davinci.ui.widgets.FileFieldDialog", WidgetLite, {
	//Maintain set of connections for clean-up
	_connection: [],
	
	_fileSelectionDialog: null,
	
	buildRendering: function(){
		this.domNode =   dojo.doc.createElement("div",{style:"width:100%"});
		this._textField = getId();
		this._button = getId();
		var template="<div style='float:right;'><button type='button' style='font-size:1em;' id='" + this._button + "'>...</button></div>";
		template += "<div style='margin-right:35px;padding:1px 0;'><input style='width:100%; padding:1.5px 0;' type='text' id='" + this._textField + "'></input></div>";
		this.domNode.innerHTML = template;
		this.inherited(arguments);
	},

	startup : function(){
		this.inherited(arguments);
		var data={file  : null};
		this._button = dojo.byId(this._button);
		dojo.connect(this._button, "onclick", this, function() {
			this._showFileSelectionDialog();
		});
		
		var _textField = dojo.byId(this._textField);
		dojo.connect(_textField,"onchange", this,"_onChange");
	},
	
	_showFileSelectionDialog: function() {
		this._fileSelectionDialog = new Dialog({
			title : uiNLS.selectFile,
			style : "width:275px;height:220px;background-color:white;"
		});

		//Set-up file selection tree
		var treeParms= {  
			id: "fileFieldDialogFileSelectionTree",
			style: "height:10em;overflow:auto;margin-bottom:10px;",
			model: system.resource,
			filters: "new system.resource.FileTypeFilter(parms.fileTypes || '*');" //See #1725
	    };
		var tree = new Tree(treeParms);

		this._fileSelectionDialog.containerNode.appendChild(tree.domNode);
		
		//Set-up button
		var okClicked = function() {
			var tree = dijit.byId("fileFieldDialogFileSelectionTree");
			if (tree.selectedItem) {
				var selectedItemPathStr = tree.selectedItem.getPath();
				var _textField = dojo.byId(this._textField);
				dojo.attr(_textField, "value", selectedItemPathStr);
				this._fileSelectionDialog.hide();
				this._fileSelectionDialog.destroyRecursive();
		    	delete this._fileSelectionDialog;
				this._onChange();
			}
		};
		var dijitLangObj = commonNLS;
		var okLabel = dijitLangObj.buttonOk;
		var okStyle = 'padding:8px;';
		var okBtn = new Button({
			label : okLabel,
			style : okStyle, /* type:"submit", */
			onClick : dojo.hitch(this, okClicked)
		});
		this._fileSelectionDialog.containerNode.appendChild(okBtn.domNode);
		
		//Set up cancel handler
		var onCancelFileSelection = function(e) {
			this._fileSelectionDialog.destroyRecursive();
			delete this._fileSelectionDialog;
		};
		this._connection.push(dojo.connect(this._fileSelectionDialog, "onCancel", this,
			onCancelFileSelection));
		
		//Show dialog
		this._fileSelectionDialog.show();
	},
	
	_setBaseLocationAttr : function(baseLocation){
		// this is the directory to make everything relative to. also the first directory to show
		this._baseLocation = baseLocation;
	},
	
	_setValueAttr : function(value){
		 if(this.value!= value ){
			this.value = value;
			var _textField = dojo.byId(this._textField);
			dojo.attr(_textField, "value", value);
		 }
	},
	
	_onChange : function(){
		var _textField = dojo.byId(this._textField);
		var v1 = dojo.attr(_textField, "value");
		
		var path=new Path(v1);
		var value=path.relativeTo(new Path(this._baseLocation), true).toString(); // ignore the filename to get the correct path to the image
		
		if(this.value!=value){			
			this.value = value;
			var _textField = dojo.byId(this._textField);
			dojo.attr(_textField, 'value', this.value);
			this.onChange(value);
		}
	},
	
	onChange : function(event){},
	
	_getValueAttr : function(){
		return  dojo.attr(this._textField, "value");	
	},
	
	destroy: function() {
		//Clean-up connections
		while (connection = this._connection.pop()){
			dojo.disconnect(connection);
		}
		
		//Clean up dialog
		if (_fileSelectionDialog) {
			this._fileSelectionDialog.destroyRecursive();
			delete this._fileSelectionDialog;
		}
	}
});
});
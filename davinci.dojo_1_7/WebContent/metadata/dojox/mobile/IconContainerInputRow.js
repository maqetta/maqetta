define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dijit/_Widget",
	"dijit/_Templated",
	"dijit/form/Button",
	"dijit/Dialog",
	"dijit/Tree",
	"davinci/model/Path",
	"dojo/text!./templates/IconContainerInputRow.html",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!../../dojox/nls/dojox",
	"dojo/i18n!dijit/nls/common"
], function(
	declare,
	lang,
	_Widget,
	_Templated,
	Button,
	Dialog,
	Tree,
	Path,
	templateString,
	dijitLangObj,
	dojoxNls,
	commonNls
) {

return declare([_Widget, _Templated], {
	templateString: templateString,
	widgetsInTemplate: true,

	label: "",
	icon: null,
	widget: null,

	onAddRow: null,
	onRemoveRow: null,

	selectedFile: null,

	labelLabel: dojoxNls.iconContainerLabel,
	iconLabel: dojoxNls.iconContainerIcon,
	chooseLabel: dojoxNls.iconContainerChooseIcon,

	postCreate: function() {
		this.labelTextBox.attr("value", this.label)

		if (this.icon) {
			// handle data: urls
			this.iconImg.setAttribute("src", this.icon.substr(0,5) == "data:" ? this.icon : this._getFullUrl(this.icon));
		}
	},

	getLabel: function() {
		return this.labelTextBox.attr("value")
	},

	getIcon: function() {
		return this.icon;
	},

	_onAddRow: function(e) {
		if (this.onAddRow) {
			this.onAddRow(this);
		}
	},

	_onRemoveRow: function(e) {
		if (this.onRemoveRow) {
			this.onRemoveRow(this);
		}
	},

	_onFileSelect: function() {
		this.fileSelection();
	},

	fileSelection: function(e){
		this._fileSelectionDialog = new Dialog({
			title : dojoxNls.selectSource,
			style : "width:275px;height:220px;padding:0px;background-color:white;"
		});

		//Set-up file selection tree
		var treeParms= {	
			id: "dataGridInputFileSelectionTree",
			persist: false,
			style: "height:10em;margin-top:10px;overflow:auto",
			model: system.resource,
			filters: "new system.resource.FileTypeFilter(parms.fileTypes || '*');" //See #1725
			};
		var tree = new Tree(treeParms);

		this._fileSelectionDialog.containerNode.appendChild(tree.domNode);
		
		//Set-up button
		var okClicked = function() {
			var tree = dijit.byId("dataGridInputFileSelectionTree");
			if (tree.selectedItem) {
				this.selectedFile = tree.selectedItem.getPath();
				var selectedItemPathStr = tree.selectedItem.getPath();
				var path = new Path(selectedItemPathStr),
				srcDocPath = new Path(this.widget._edit_context._srcDocument.fileName);
				// ignore the filename to get the correct path to the image
				var value = path.relativeTo(srcDocPath, true).toString();
				this.icon = value;
				this._fileSelectionDialog.destroyRecursive();
				delete this._fileSelectionDialog;
				this._fileSelected();
			}
		};
		var okLabel = commonNls.buttonOk;
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

		dojo.connect(this._fileSelectionDialog, "onCancel", this, onCancelFileSelection);
		
		//Show dialog
		this._fileSelectionDialog.show();
	},

	_fileSelected: function() {
		var path = new Path(this.selectedFile);
		var srcDocPath = new Path(this.widget._edit_context._srcDocument.fileName);
		value = path.relativeTo(srcDocPath, true).toString(),

		this.iconImg.src = this._getFullUrl(value);
	},

	_getFullUrl: function(url) {
		var fullUrl;

		var patt=/http:\/\//i;
		if (patt.test(url)){ // absolute url
			fullUrl = url;
		} else {
			var parentFolder = new Path(this.widget._edit_context._srcDocument.fileName)
				 .getParentPath().toString();
			// relative so we have to get the absolute for the update of the store
			var file = system.resource.findResource(url, null, parentFolder);
			if (!file){
				alert('File: ' + this._url + ' does not exsist.');
				return;
			}
			fullUrl = file.getURL();
		}

		return fullUrl;
	},

	uninitialize: function() {
	}
});

});

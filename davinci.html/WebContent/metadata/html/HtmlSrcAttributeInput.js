define([
	"dojo/_base/declare",
	"davinci/ve/input/SmartInput",
	"davinci/model/Path",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"dijit/Dialog",
	"dijit/layout/ContentPane",	
	"dijit/form/Button",
    "dijit/Tree",
    "dojo/text!./templates/srcAttributeInputFields.html",
    "dojo/i18n!dijit/nls/common",
	"dojo/i18n!./nls/html"
], function(
	declare,
	SmartInput,
	Path,
	Widget,
	ModifyCommand,
	Dialog,
	ContentPane,
	Button,
	Tree,
	templateString,
	commonNls,
	htmlNls
) {

return declare(SmartInput, {
	// Added this so we can re-use this class for elements that do not support an
	// "alt" attribute (such as AUDIO, EMBED, and VIDEO)
	supportsAltText: true,

	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);
		if (!this._inline) {
			this._inline = new Dialog({
				title : htmlNls.selectSource,
				style : "width:275px;height:275px;padding:0px;background-color:white;"
			});
	
			var contentPane = new ContentPane();
			this._inline.set("content", contentPane);
			dojo.style(contentPane.domNode, "overflow", "auto");
	
			//Set-up file selection tree
			var treeParms= {  
				id: "htmlSrcAttributeInputSelectionTree",
				style: "height:10em;overflow:auto",
				model: system.resource,
				filters: "new system.resource.FileTypeFilter(parms.fileTypes || '*');" //See #1725
		    };
			var tree = new Tree(treeParms);
			contentPane.domNode.appendChild(tree.domNode);
			
			var onTreeClick = function(selection) {
				var inputPath = new Path(selection.getPath());
				var filePath = new Path(this._widget._edit_context._srcDocument.fileName);
				// ignore the filename to get the correct path to the image
				var relativePath = inputPath.relativeTo(filePath, true).toString();
				
				//Put path in text box
				var srcTextBox = dijit.byId("srcAttributeInputSrcTextBox");
				srcTextBox.set("value", relativePath);
			};
			this._connection.push(dojo.connect(tree, "onClick", this, onTreeClick));

			//Set up input field area
			var textInputcontentPane = new ContentPane({style: "padding:0;margin-top:8px;"});
			contentPane.domNode.appendChild(textInputcontentPane.domNode);
			textInputcontentPane.set("content", templateString);

			//Set-up src text box
			var srcLabel = dojo.byId("srcAttributeInputSrcLabel");
			srcLabel.innerHTML = htmlNls.typeFileUrl;
			var srcTextBox = dijit.byId("srcAttributeInputSrcTextBox");
			srcTextBox.set("value", this._widget._srcElement.getAttribute('src') || '');
			
			//Set up alt text text box
			var altLabel = dojo.byId("srcAttributeInputAltLabel");
			altLabel.innerHTML = htmlNls.typeAltText;
			var altTextBox = dijit.byId("srcAttributeInputAltTextBox");
			if (this.supportsAltText) {
				altTextBox.set("value", this._widget._srcElement.getAttribute('alt') || '');
			} else {
				//Hide both label and text box
				dojo.setStyle(altLabel, {
				    display:"none"
				  });
				altTextBox.set("style", "display: none;");
			}
			
			//Set-up button
			var okClicked = function() {
				var srcTextBox = dijit.byId("srcAttributeInputSrcTextBox");
				var altTextBox = dijit.byId("srcAttributeInputAltTextBox");
				var srcText = srcTextBox.get("value");
				var altText = altTextBox.get("value");
				
				//Clean -up
		    	this._inline.destroyRecursive();
		    	delete this._inline;
			    	
		    	//Update the underlying widget
		    	this.updateWidget(srcText, altText);
			};
			var dijitLangObj = commonNls;
			var okLabel = dijitLangObj.buttonOk;
			var okStyle = 'padding:8px;';
			var okBtn = new Button({
				label : okLabel,
				style : okStyle, /* type:"submit", */
				onClick : dojo.hitch(this, okClicked)
			});
			this._inline.containerNode.appendChild(okBtn.domNode);
			
			//Set up cancel handler
			var onCancelFileSelection = function(e) {
				this._inline.destroyRecursive();
				delete this._inline;
			};
			this._connection.push(dojo.connect(this._inline, "onCancel", this,
				onCancelFileSelection));
			
			//Show dialog
			this._inline.show();
		}
	},

	hide: function(cancel) {
		if (this._inline) {
			//Clean up connections
			while (connection = this._connection.pop()){
				dojo.disconnect(connection);
			}
			
			//Destroy dialog and widgets
			this._inline.destroyRecursive();
			delete this._inline;
		}
		this.inherited(arguments);
	},

	updateWidget: function(srcText, altText) {
		var values = {};
		values.src = srcText;
		if (this.supportsAltText) {
			values.alt = altText;
		}
		var context = this._widget.getContext();
		var command = new ModifyCommand(this._widget, values, null, context);
		this._widget._edit_context.getCommandStack().execute(command);
		this._widget = command.newWidget;
		// get the focus on the current node
		this._widget._edit_context._focuses[0]._selectedWidget = this._widget; 
		// redraw the box around the
		context.select(this._widget, null, false); 
	}
});
});
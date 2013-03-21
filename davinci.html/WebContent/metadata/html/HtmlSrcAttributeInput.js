define([
	"dojo/_base/declare",
	"davinci/ve/input/SmartInput",
	"davinci/model/Path",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ui/Dialog",
	"dijit/form/Button",
	"dijit/Tree",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dojo/text!./templates/srcAttributeInputFields.html",
	"dojo/i18n!./nls/html"
], function(
	declare,
	SmartInput,
	Path,
	Widget,
	ModifyCommand,
	Dialog,
	Button,
	Tree,
	BorderContainer,
	ContentPane,
	templateString,
	htmlNls
) {

return declare(SmartInput, {
	// Added this so we can re-use this class for elements that do not support an
	// "alt" attribute (such as AUDIO, EMBED, and VIDEO)
	supportsAltText: true,

	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);

		var okClicked = function() {
			var srcTextBox = dijit.byId("srcAttributeInputSrcTextBox");
			var altTextBox = dijit.byId("srcAttributeInputAltTextBox");
			var srcText = srcTextBox.get("value");
			var altText = altTextBox.get("value");

			//Update the underlying widget
			this.updateWidget(srcText, altText);
		};

		var container = new BorderContainer({});
		this._inline = Dialog.showDialog({
			title: htmlNls.selectSource, 
			content: container, 
			style: {width: 350, height:420}, 
			okCallback: dojo.hitch(this, okClicked)
		});

		var cp1 = new ContentPane({region: "center"});
		container.addChild(cp1);

		//Set-up file selection tree
		var treeParms= {  
			id: "htmlSrcAttributeInputSelectionTree",
			persist: false,
			style: "height:10em;margin-bottom:12px;overflow:auto;",
			model: system.resource,
			filters: "new system.resource.FileTypeFilter(parms.fileTypes || '*');" //See #1725
			};
		var tree = new Tree(treeParms);
		cp1.addChild(tree);
		
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

		var cp2 = new ContentPane({region: "bottom", style: "height: 50px"});
		container.addChild(cp2);

		//Set up input field area
		var textInputDiv = dojo.create('div');
		textInputDiv.innerHTML = templateString;
		dojo.parser.parse(textInputDiv);
		cp2.domNode.appendChild(textInputDiv);

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
	},

	updateWidget: function(srcText, altText) {
		var values = {src: srcText};
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
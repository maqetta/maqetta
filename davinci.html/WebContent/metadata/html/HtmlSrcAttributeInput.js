define([
	"dojo/_base/declare",
	"davinci/ve/input/SmartInput",
	"davinci/model/Path",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ui/Panel",
	"dojo/i18n!./nls/html"
], function(
	declare,
	SmartInput,
	Path,
	Widget,
	ModifyCommand,
	Panel,
	htmlNls
) {

return declare(SmartInput, {
	// Added this so we can re-use this class for elements that do not support an
	// "alt" attribute (such as AUDIO, EMBED, and VIDEO)
	supportsAltText: true,

	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);

		var definition = [
			{
				type: "tree",
				data: "file",
				model: system.resource,
				filters: "new system.resource.FileTypeFilter(parms.fileTypes || '*');",
				link: {
					target: "textValue",
					targetFunction: function(input) {
						var inputPath = new Path(input.getPath()),
							filePath = new Path(this._widget._edit_context._srcDocument.fileName);
						// ignore the filename to get the correct path to the image
						return inputPath.relativeTo(filePath, true).toString();
					}
				}
			},
			{
				id: "textValue",
				type: "textBox",
				label: htmlNls.typeFileUrl,
				data: "textValue"
			}
		];

		var data = {
			file: null,
			textValue: this._widget._srcElement.getAttribute('src') || ''
		};

		if (this.supportsAltText) {
			definition.push({
				type: "textBox",
				label: htmlNls.typeAltText,
				data: "altText"
			});
			data.altText = this._widget.attr('alt') || '';
		}

		Panel.openDialog({
			definition: definition,
			data: data,
			title: htmlNls.selectSource,
			contextObject: this,
			onOK: function() {
				if (data.textValue !== "") {
					this.updateWidget(data.textValue, data.altText);
				}
			}
		});
	},

	destroy: function() {
		if (this._inline) {
			this._inline.destroyDescendants();
			this._inline.destroy();
			delete this._inline;
		}
	},

	updateDialog: function(value) {
		if (value && value !== "") {
			var obj = dijit.byId('srcFileURLInputBox');
			var valuePath = new Path(value),
				filePath = new Path(this._widget._edit_context._srcDocument.fileName);
			// ignore the filename to get the correct path to the image
			value = valuePath.relativeTo(filePath, true).toString();
			obj.attr('value', value);
		}
	},

	updateWidget: function(value, altText) {
		var values = {};
		values.src = value;
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
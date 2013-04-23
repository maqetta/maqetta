define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/query",
	"davinci/ui/Dialog",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/input/SmartInput",
	"davinci/ve/widget",
	"dojo/text!./templates/gridLayoutInput.html",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!../../dojox/nls/dojox",
	"dijit/form/NumberSpinner"
], function(
	declare,
	lang,
	query,
	Dialog,
	ModifyCommand,
	SmartInput,
	Widget,
	templateString,
	dijitLangObj,
	dojoxNLS
) {

return declare(SmartInput, {
	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);

		var hideCancel = false;

		if (this._widget.inLineEdit_displayOnCreate){
			// hide cancel on widget creation #120
			delete this._widget.inLineEdit_displayOnCreate;
			hideCancel = true;
		}

		this._inline = Dialog.showDialog({
			title: dojoxNLS.gridLayoutInputTitle, 
			content: this._getTemplate(), 
			style: null, 
			okCallback: dojo.hitch(this, "_onOk"), 
			okLabel: null, 
			hideCancel: hideCancel
		});

		var spinners = query(".dijitSpinner", this._inline.containerNode);

		var cols = this._widget.getData().properties.cols;
		dijit.byNode(spinners[0]).set("value", Math.ceil(this._widget.getData().children.length/cols));
		dijit.byNode(spinners[1]).set("value", cols);
	},

	_onOk: function(e) {
		this.updateWidget();
	},

	updateWidget: function() {
		var context = this._widget.getContext();

		var spinners = query(".dijitSpinner", this._inline.containerNode);

		var rows = dijit.byNode(spinners[0]).get("value");
		var cols = dijit.byNode(spinners[1]).get("value");

		var props = {cols: cols};
		var children = [];

		for (var i = 0; i < Math.ceil(rows*cols); i++) {
			children.push({type: "dojox/mobile/Pane", properties: {}});
		}

		var command = new ModifyCommand(this._widget, props, children, this._widget._edit_context);
		this._widget._edit_context.getCommandStack().execute(command);

		// redraw the box around the widget
		var widget = command.newWidget;
		context.select(widget, null, false); 
	},

	_getTemplate: function() {
		if (!this._substitutedMainTemplate) {
			this._substitutedMainTemplate = 
				dojo.replace(templateString, {
					numberOfRows: dojoxNLS.numberOfRows,
					numberOfCols: dojoxNLS.numberOfCols
				});
		}
			
		return this._substitutedMainTemplate;
	}
});

});

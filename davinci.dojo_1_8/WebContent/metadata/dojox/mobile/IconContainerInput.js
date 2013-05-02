define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dojo/query",
	"davinci/ui/Dialog",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/RemoveCommand",
	"davinci/commands/CompoundCommand",
	"davinci/ve/input/SmartInput",
	"davinci/ve/widget",
	"./IconContainerInputRow",
	"dojo/text!./templates/IconContainerInput.html",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!../../dojox/nls/dojox"
], function(
	declare,
	lang,
	domConstruct,
	Query,
	Dialog,
	AddCommand,
	RemoveCommand,
	CompoundCommand,
	SmartInput,
	Widget,
	IconContainerInputRow,
	mainTemplateString,
	dijitLangObj,
	dojoxNLS
) {

return declare(SmartInput, {
	_substitutedMainTemplate: null,
	childType: "dojox/mobile/IconItem",
	dialogTitle: dojoxNLS.iconContainerTitle,

	show: function(widgetId) {

		this._widget = Widget.byId(widgetId);

		this._inline = Dialog.showDialog({
			title: this.dialogTitle, 
			content: this._getTemplate(), 
			style: {width: 550, height: 300}, 
			okCallback: dojo.hitch(this, "_onOk")
		});

		// fill in rows
		var data = this._widget.getData();
		for (var i = 0; i < data.children.length; i++) {
			var child = data.children[i];
			if (child.type == this.childType) {
				var label = child.properties.label;
				var icon = child.properties.icon;

				this._addRow(label, icon);
			}
		}
	},

	_addRow: function(label, icon, refNode, pos) {
		var rowContainer = dojo.query(".iconContainerInputRows", this._inline.containerNode)[0];

		var div = document.createElement("div");

		if (refNode) {
			domConstruct.place(div, refNode, pos);
		} else {
			domConstruct.place(div, rowContainer);
		}

		new IconContainerInputRow({label: label, icon: icon, widget: this._widget, onAddRow: dojo.hitch(this, "_onAddRow"), onRemoveRow: dojo.hitch(this, "_onRemoveRow")}, div);
	},

	_onAddRow: function(widget) {
		var pos;
		var children = Query(".iconContainerInputRow", this._inline.containerNode);

		for (var i = 0; i < children.length; i++) {
			if (children[i] == widget.domNode) {
				pos = i;
			}
		}

		if ((pos+1) < children.length) {
			this._addRow(dojoxNLS.iconContainerNewItem+(pos+2), "", children[pos], "after");
		} else {
			this._addRow(dojoxNLS.iconContainerNewItem+(pos+2), "");
		}
	},

	_onRemoveRow: function(widget) {
		var children = Query(".iconContainerInputRow", this._inline.containerNode);

		// don't allow removing the last row
		if (children.length > 1) {
			widget.destroyRecursive();
			widget = null;
		}
	},

	_onOk: function(e) {
		this.updateWidget();
	},

	_onCancel: function(e) {
		this.onCancel();
	},

	updateWidget: function() {
		var context = this._widget.getContext();

		// our compound commapnd
		var command = new CompoundCommand();

		// remove all children
		var children = this._widget.getChildren();
		for (var i = 0; i < children.length; i++) {
			command.add(new RemoveCommand(children[i]));
		}

		// now add the new children
		var children = Query(".iconContainerInputRow", this._inline.containerNode);

		for (var i = 0; i < children.length; i++) {
			var row = dijit.byNode(children[i]);

			var w;
			var data = {"type": this.childType, context: context, "properties": {"label": row.getLabel(), "icon": row.getIcon()}};
			dojo.withDoc(context.getDocument(), function(){
					w = Widget.createWidget(data, {parent: this._widget});
			}, this);

			command.add(new AddCommand(w, this._widget));
		}

		this._widget._edit_context.getCommandStack().execute(command);

		// redraw the box around the widget
		context.select(this._widget, null, false); 
	},

	hide: function(cancel) {
		if (this._inline) {
			//Clean up connections
			var connection;
			while (connection = this._connection.pop()){
				dojo.disconnect(connection);
			}
		}

		this.inherited(arguments);
	},

	_getTemplate: function(width, height) {
		if (!this._substitutedMainTemplate) {
			this._substitutedMainTemplate = 
				dojo.replace(mainTemplateString, {
					buttonOk: dijitLangObj.buttonOk,
					buttonCancel: dijitLangObj.buttonCancel
				});
		}
			
		return this._substitutedMainTemplate;
	}
});

});

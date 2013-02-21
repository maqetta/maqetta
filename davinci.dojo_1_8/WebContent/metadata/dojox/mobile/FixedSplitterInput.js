define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dojo/query",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"davinci/ve/widget",
	"davinci/ve/input/SmartInput",
	"davinci/ui/Dialog",
	"davinci/ve/commands/ModifyCommand",
	"davinci/html/CSSParser",
	"dojo/text!./templates/fixedSplitterInput.html",
	"dojo/text!./templates/fixedSplitterInputRow.html",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!../../dojox/nls/dojox",
	"dijit/form/RadioButton"
], function(
	declare,
	lang,
	domConstruct,
	Query,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Widget,
	SmartInput,
	Dialog,
	ModifyCommand,
	CSSParser,
	templateString,
	templateRowString,
	dijitLangObj,
	dojoxNLS
) {

var ContinerInputWidget = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	dojoxNLS: dojoxNLS,

	data: null,

	postCreate: function() {
		if (this.data) {
			var orientation = this.data.properties.orientation;
			if (orientation == "V") {
				this.orientationVRadioButton.set("checked", true);
			} else {
				this.orientationHRadioButton.set("checked", true);
			}

			dojo.forEach(this.data.children, lang.hitch(this, function(child) {
				this._addRow(child);
			}));
		}
	},

	_onChangeRadioButton: function(e) {
		var orientation;

		if (this.orientationHRadioButton.get("checked")) {
			orientation = "H";
		} else {
			orientation = "V";
		}

		dojo.forEach(dojo.query(".inputRow", this.rows), function(child) {
			var d = dijit.byNode(child);
			if (d) {
				d.setOrientation(orientation);
			}
		});
	},

	_addRow: function(data, parent, pos) {
		var div = document.createElement("div");

		if (parent) {
			domConstruct.place(div, parent, pos);
		} else {
			domConstruct.place(div, this.rows);
		}

		new ContinerInputWidgetRow({data: data, orientation: this.data.properties.orientation, onAddRow: lang.hitch(this, "_onAddRow"), onRemoveRow: lang.hitch(this, "_onRemoveRow")}, div);
	},

	_onAddRow: function(widget) {
		var children = Query(".inputRow", this.rows);
		var pos;

		for (var i = 0; i < children.length; i++) {
			if (children[i] == widget.domNode) {
				pos = i;
			}
		}

		if ((pos+1) < children.length) {
			this._addRow({}, children[pos], "after");
		} else {
			this._addRow({});
		}
	},

	_onRemoveRow: function(widget) {
		var children = Query(".inputRow", this.rows);

		// always have 2 rows
		if (children.length > 2) {
			widget.destroyRecursive();
			delete widget;
		}
	},

	getValue: function() {
		var value = {properties: this.data.properties, children: []};

		if (this.orientationHRadioButton.get("checked")) {
			orientation = "H";
		} else {
			orientation = "V";
		}
		value.properties.orientation = orientation;

		delete value.properties.variablePane;

		if (value.properties.isTempID){
			delete value.properties.id; // delete temp id so it does not make it's way out to the source
		}

		var children = Query(".inputRow", this.rows);

		var idx = 0;
		dojo.forEach(children, function(child) {
			value.children.push(dijit.byNode(child).getValue());

			if (dijit.byNode(child).getUsingRemainingSpace()) {
				value.properties.variablePane = idx; 
			}

			idx++;
		});

		return value;
	}
});

var ContinerInputWidgetRow = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateRowString,
	dojoxNLS: dojoxNLS,

	data: null,
	orientation: null,

	postCreate: function() {
		this._buildOrientation();

		if (this.data && this.data.properties) {
			var hasValue = false;

			// if we have style, get the width/height value
			if (this.data.properties.style) {
				var parse = CSSParser.parse(".foo{"+this.data.properties.style+"}");
	
				if (parse.model) {
					dojo.forEach(parse.model[0].children, dojo.hitch(this, function(prop) {
						if (prop.name == "width" && this.orientation == "H") {
							this.textBox.set("value", prop.value);
							hasValue = true;
						} else if (prop.name == "height" && this.orientation == "V") {
							this.textBox.set("value", prop.value);
							hasValue = true;
						}
					}));
				}
			}

			if (!hasValue) {
				this.useRemaingingSpace.set("checked", true);
			}
		}
	},

	_buildOrientation: function() {
		this.propertyContainer.innerHTML = this.orientation == "V" ? dojoxNLS.fixedSpliterInputHeight : dojoxNLS.fixedSpliterInputWidth;
	},

	setOrientation: function(orientation) {
		this.orientation = orientation;
		this._buildOrientation();
	},

	_onChangeCheckbox: function() {
		if (this.useRemaingingSpace.get("checked")) {
			this.textBox.set("value", "");
		}
	},

	_onChangeTextbox: function() {
		// if the textbox has a value, uncheck the useRemainingSpace
		if (this.textBox.get("value").length > 0) {
			this.useRemaingingSpace.set("checked", false);
		}
	},

	_onAddRow: function() {
		if (this.onAddRow) {
			this.onAddRow(this);
		}
	},

	_onRemoveRow: function() {
		if (this.onRemoveRow) {
			this.onRemoveRow(this);
		}
	},

	getUsingRemainingSpace: function() {
		return this.useRemaingingSpace.get("checked");
	},

	getValue: function() {
		var value = {type: "dojox.mobile.Pane", properties: {}};

		var style = "";
		var textValue = this.textBox.get("value");

		if (this.data && this.data.properties && this.data.properties.style) {
			var parse = CSSParser.parse(".foo{"+this.data.properties.style+"}");
	
			var foundProp = false;

			if (parse.model) {
				dojo.forEach(parse.model[0].children, dojo.hitch(this, function(prop) {
					if (prop.name == "width") {
						if (this.orientation == "H") {
							if (!this.useRemaingingSpace.get("checked")) {		
								if (textValue) {
									prop.value = textValue;
									style += prop.getText();
									foundProp = true;
								}
							}
						}
					} else if (prop.name == "height") {
						if (this.orientation == "V") {
							if (!this.useRemaingingSpace.get("checked")) {		
								if (textValue) {
									prop.value = textValue;
									style += prop.getText();
									foundProp = true;
								}
							}
						}
					} else {
						style += prop.getText();
					}
				}));

				if (!this.useRemaingingSpace.get("checked") && textValue && !foundProp) {
					if (this.orientation == "H") {
						style += "width:"+textValue+";"
					} else {
						style += "height:"+textValue+";"
					}
				}
			}
		} else {
			if (!this.useRemaingingSpace.get("checked") && textValue) {
				if (this.orientation == "H") {
					style = "width:"+textValue+";"
				} else {
					style = "height:"+textValue+";"
				}
			}
		}

		if (style) {
			value.properties.style = style;
		}

		return value
	}
});

return declare(SmartInput, {
	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);

		var hideCancel = false;
		if (this._widget.inLineEdit_displayOnCreate){
			// hide cancel on widget creation #120
			delete this._widget.inLineEdit_displayOnCreate;
			hideCancel = true;
		}

		this._containerInput = new ContinerInputWidget({data: this._widget.getData()});

		this._inline = Dialog.showDialog({
			title: dojoxNLS.fixedSpliterInputTitle, 
			content: this._containerInput, 
			style: {width: 550, height: 300}, 
			okCallback: dojo.hitch(this, "_onOk"), 
			okLabel: null, 
			hideCancel: hideCancel
		});
	},

	_onOk: function() {
		this.updateWidget();
	},

	updateWidget: function() {
		var context = this._widget.getContext();

		var data = this._containerInput.getValue();

		var command = new ModifyCommand(this._widget, data.properties, data.children, this._widget._edit_context);

		this._widget._edit_context.getCommandStack().execute(command);

		// redraw the box around the widget
		var widget = command.newWidget;
		if(widget){
			context.select(widget, null, false); 
		}
	}

});

});

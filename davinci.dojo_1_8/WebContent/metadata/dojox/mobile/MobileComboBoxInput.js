define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dijit/registry",
	"dojox/html/entities",
	"davinci/Runtime",
	"davinci/ve/input/SmartInput",
	"davinci/ve/widget",
	"davinci/commands/OrderedCompoundCommand",
	"davinci/ve/commands/ModifyCommand",
	"dojo/i18n!../nls/dojox"
], function (
	declare,
	Lang,
	Registry,
	Entities,
	Runtime,
	SmartInput,
	Widget,
	OrderedCompoundCommand,
	ModifyCommand,
	dojoxNls
) {

return declare(SmartInput, {

	property: "value",
	
	displayOnCreate: "true",
	
	multiLine: "true",
	
	format: "rows",
	
	supportsHTML: "false",

	helpText: "",
	
	constructor : function() {
		this.helpText = dojoxNls.mobileComboBoxHelp1 + "<br />" + dojoxNls.mobileComboBoxHelp2;
	},
	
	getProperties: function(widget, options) {
		var oldValue = widget.attr("value");
		var value;
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			if (option.selected) {
				value = option.text;
				break;
			} else if(option.text == oldValue) {
				value = oldValue;
			}
		}
		return {value:value};
	},
	
	serialize: function(widget, updateEditBoxValue, value) {
		var data = widget.dijitWidget.store.domNode._dvWidget.getData();
		var children = data.children;
		var result = [];
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var text = child.properties.value;
			text = Entities.decode(text);
			var selected = (value == text) ? "+" : "";
			result.push(selected + text);
		}
		
		result = this.serializeItems(result);

		updateEditBoxValue(result); 
	},
	
	parse: function(input) {
		var value = this.parseItems(input);
		for (var x = 0; x < value.length; x++){
			value[x].text = Entities.encode(value[x].text);
		}
		return value;
	},
	
	update: function(widget, values) {
		if (values.length < 1) {
			return;
		}
		var data = widget.dijitWidget.store.domNode._dvWidget.getData();
		var children = data.children;
		var selectedItem;
		for (var i = 0; i < values.length; i++) {
			var value = values[i];
			var text = value.text;
			if (i < children.length) {
				var child = children[i];
				child.children = text;
				child.properties.value = text;
				if (value.selected){
					selectedItem = text;
				}
			} else {
				children.push(this.createChildData(text, text, value.selected));
			}
			if (!this.isHtmlSupported()){
				values[i].text = Entities.decode(text);
			}
		}
		
		if (values.length > 0) {
			var length = children.length;
			for (var i = values.length; i < length; i++) {
				var child = children[i];
				children.pop();
			}
		}
		var dataListId = widget.dijitWidget.store.id;
		var dataListWidget = Widget.byId(dataListId);
		var comboBoxProps = {}; 
		var dataListProps = {};
		if (!selectedItem) {
			selectedItem = values[0].text;
		}
		dataListProps['data-dojo-props'] = 'id:"'+dataListId+'"';
		comboBoxProps['data-dojo-props'] = 'value:"'+selectedItem+'", list:"'+dataListId+'"';
		var command = new OrderedCompoundCommand();
		var x = Lang.getObject(dataListId);
		var y = Registry.byId(dataListId);
		
		command.add(new ModifyCommand(dataListWidget, dataListProps, children));
		var comboBoxCommand = new ModifyCommand(widget, comboBoxProps, []);
		command.add(comboBoxCommand);
		this._getContext().getCommandStack().execute(command);
		return comboBoxCommand.newWidget;
	},

	show: function(widgetId) {
		 this._widget = Widget.byId(widgetId);
		 this.inherited(arguments);
	},
	
	_getEditor: function() {
		return Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this._getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	},
	
	createChildData: function(value, text, selected) {
		return {type: "html.option", properties: {value: value}, children: text || value};
	}

});

});
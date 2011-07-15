dojo.provide("davinci.ve.input.MobileComboBoxInput");
dojo.require("davinci.ve.input.SmartInput");
dojo.require("davinci.commands.OrderedCompoundCommand");

dojo.declare("davinci.ve.input.MobileComboBoxInput", davinci.ve.input.SmartInput, {
	property: "value",
	
	displayOnCreate: "true",
	
	multiLine: "true",
	
	format: "rows",
	
	displayOnCreate: "true",
	
	supportsHTML: "false",
	helpText: 'Enter multiple lines of text each line will correspond to a option item in the list. <br /> Indicate the default option to be selected with the "+" at the start of the line. ',
	
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
		

		var data = widget.dijitWidget.store.domNode._dvWidget.getData();;
		var children = data.children;
		var result = [];
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var text = child.properties.value;
			text = dojox.html.entities.decode(text);
			var selected = (value == text) ? "+" : "";
			result.push(selected + text);
		}
		
		result = this.serializeItems(result);

		updateEditBoxValue(result); 
	},
	
	parse: function(input) {
		var value = this.parseItems(input);
		for (var x = 0; x < value.length; x++){
			value[x].text = dojox.html.entities.encode(value[x].text);
		}
		return value;
	},
	
	update: function(widget, values) {
		if (values.length < 1)
			return;
		var data = widget.dijitWidget.store.domNode._dvWidget.getData();;
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
				values[i].text = dojox.html.entities.decode(text);
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
		var dataListWidget = davinci.ve.widget.byId(dataListId);
		var comboBoxProps = {}; 
		var dataListProps = {};
		if (!selectedItem) {
			selectedItem = values[0].text;
		}
		dataListProps['data-dojo-props'] = 'id:"'+dataListId+'"';
		comboBoxProps['data-dojo-props'] = 'value:"'+selectedItem+'", list:"'+dataListId+'"';
		var command = new davinci.commands.OrderedCompoundCommand();
		var x = dojo.getObject(dataListId);
		var y = dijit.byId(dataListId);
		
		command.add(new davinci.ve.commands.ModifyCommand(dataListWidget, dataListProps, children));
		var comboBoxCommand = new davinci.ve.commands.ModifyCommand(widget, comboBoxProps, []);
		command.add(comboBoxCommand);
		this._getContext().getCommandStack().execute(command);
		return comboBoxCommand.newWidget;
	},

	show: function(widgetId){

		 this._widget = davinci.ve.widget.byId(widgetId);
		 this.inherited(arguments);
	},
	
	_getEditor: function() {
		return top.davinci && top.davinci.Runtime && top.davinci.Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this._getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	},
	
	createChildData: function(value, text, selected) {
		return {type: "html.option", properties: {value: value}, children: text || value};
	}
	

	

});
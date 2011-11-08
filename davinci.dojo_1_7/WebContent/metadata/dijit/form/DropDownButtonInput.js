define([
        "dojo/_base/declare",
    	"../layout/ContainerInput",
        "dojo/i18n!../nls/dijit",
        "dojox/html/entities"
], function(declare, ContainerInput, nls, entities){

return declare("davinci.libraries.dojo.dijit.form.DropDownButtonInput", ContainerInput, {

	propertyName: "label",
		
	format: "rows",
	
	multiLine: "true",
	
	supportsHTML: "true",
	
	helpText: "",
	
	constructor : function() {
		this.helpText = nls.dropDownButtonInputHelp;
	},
	
	serialize: function(widget, callback, value) {
		var result = [];
		var data = widget.getData();
		var menu = data.children[0];

		result.push(data.properties[this.propertyName]);

		if (menu) {
			var menuItems = menu.children;
			for (var j = 0; j < menuItems.length; j++) {
				var menuItem = menuItems[j];
				result.push("> " + menuItem.properties[this.propertyName]);
			}
		}
		
		result = this.serializeItems(result);

		callback(result); 
	},
	
	update: function(widget, values) {
		var data = widget.getData();
		var menu = data.children[0];
		var label, menuItems, menuItemIndex = -1;
		for (var i = 0; i < values.length; i++) {
			var value = values[i];
			var indent = value.indent;
			var text = value.text;
			
			if (i == 0) {
				label = text;
			} else {
				menuItemIndex++;
				menuItems = menu.children;
				var menuItem = menuItems[menuItemIndex];
				if (menuItem) {
					menuItem.properties.label = text;
				} else {
					menuItem = this.createMenuItemData(text);
					menuItems.push(menuItem);
				}			
			}
		}

		if (menuItems && (menuItemIndex + 1 > 0)) {
			var length = menuItems.length;
			for (var i = menuItemIndex + 1; i < length; i++) {
				menuItems.pop();
			}
		}
				
		var command = new davinci.ve.commands.ModifyCommand(widget, { label: label }, [menu]);
		this._getContext().getCommandStack().execute(command);
		return command.newWidget;
	},
	
	createMenuItemData: function(value) {
		return { 
			type: "dijit.MenuItem", 
			properties: { label: value }
		};
	},
	
	parse: function(input) {
		var result = this.parseItems(entities.decode(input));
		// i think we need to re-encode the result.text here
		if (this._format === 'text'){
			result.forEach(function(item) { item.text = entities.encode(item.text); });
		}
		return result;
	},

	end: true
});
});

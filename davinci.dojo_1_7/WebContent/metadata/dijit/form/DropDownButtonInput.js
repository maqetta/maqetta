dojo.provide("davinci.libraries.dojo.dijit.form.DropDownButtonInput");
dojo.require("davinci.libraries.dojo.dijit.layout.ContainerInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.dojo.dijit", "dijit");

dojo.declare("davinci.libraries.dojo.dijit.form.DropDownButtonInput", davinci.libraries.dojo.dijit.layout.ContainerInput, {

	propertyName: "label",
		
	format: "rows",
	
	multiLine: "true",
	
	supportsHTML: "true",
	
	helpText: "",
	
	constructor : function() {
		var langObj = dojo.i18n.getLocalization("davinci.libraries.dojo.dijit", "dijit");
		this.helpText = langObj.dropDownButtonInputHelp;
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
		var result = this.parseItems(dojox.html.entities.decode(input));
		// i think we need to re-encode the result.text here
		if (this._format === 'text'){
			for (var i=0; i < result.length; i++){
				result[i].text = dojox.html.entities.encode(result[i].text );
			}
		}
		return result;
	},
	

	end: true
});

define([
	"dojo/_base/declare",
	"./layout/ContainerInput",
	"davinci/ve/commands/ModifyCommand",
	"dojo/i18n!./nls/dijit",
	"dojox/html/entities"
], function(
	declare,
	ContainerInput,
	ModifyCommand,
	dijitNls,
	entities
) {

return declare(ContainerInput, {

	propertyName: "label",
	
	format: "rows",
	
	multiLine: "true",
	
	supportsHTML: "true",
	//supportsHTML: "false",
	
	helpText: "",

	end: true,

	constructor : function() {
		this.helpText = dijitNls.menuBarInputHelp;
	},
	
	serialize: function(widget, callback, value) {
		var result = [];
		var data = widget.getData();
		var popupMenuBarItems = data.children;
		
		for (var i = 0; i < popupMenuBarItems.length; i++) {
			var popupMenuBarItem = popupMenuBarItems[i];
			result.push(popupMenuBarItem.properties[this.propertyName]);
			var menu = popupMenuBarItem.children[0];
			if (menu) {
				var menuItems = menu.children;
				if (menuItems){
					for (var j = 0; j < menuItems.length; j++) {
						var menuItem = menuItems[j];
						result.push("> " + menuItem.properties[this.propertyName]);
					}
				}
			}
		}
		
		result = this.serializeItems(result);

		callback(result); 
	},
	
	update: function(widget, values) {
		var data = widget.getData();
		var popupMenuBarItems = data.children;
		var popupMenuBarItem, menuItems, popupMenuBarItemIndex = -1, menuItemIndex = -1;
		for (var i = 0; i < values.length; i++) {
			var value = values[i];
			var indent = value.indent;
			var text = value.text;
			if (!indent) {
				if (menuItems && (menuItemIndex + 1 > 0)) {
					var length = menuItems.length;
					for (var j = menuItemIndex + 1; j < length; j++) {
						menuItems.pop();
					}
				}
				menuItemIndex = -1;
				popupMenuBarItemIndex++;
				if (popupMenuBarItemIndex < popupMenuBarItems.length) {
					popupMenuBarItem = popupMenuBarItems[popupMenuBarItemIndex];
					popupMenuBarItem.properties.label = text;
				} else {
					popupMenuBarItem = this.createPopupMenuBarItemData(text);
					popupMenuBarItems.push(popupMenuBarItem);
				}
				// now process the children
				menuItems = popupMenuBarItem.children[0].children;
				if (!menuItems){
					menuItems = [];
					popupMenuBarItem.children[0].children = menuItems;
				}
				menuItemIndex = -1;
				while(i+1 < values.length && values[i+1].indent ){
					var value = values[++i];
					var indent = value.indent;
					var text = value.text;
					menuItemIndex++;
					//menuItems = popupMenuBarItem.children[0].children;
					var menuItem = menuItems[menuItemIndex];
					if (menuItem) {
						menuItem.properties.label = text;
					} else {
						menuItem = this.createMenuItemData(text);
						menuItems.push(menuItem);
					}
					
				}
				// remove the leftovers
				if (menuItems && (menuItemIndex + 1 < menuItems.length)) {
					var length = menuItems.length;
					for (var x = menuItemIndex + 1; x < length; x++) {
						menuItems.pop();
					}
				}
			}
		}

		
		if (popupMenuBarItemIndex + 1 > 0) {
			var length = popupMenuBarItems.length;
			for (var i = popupMenuBarItemIndex + 1; i < length; i++) {
				popupMenuBarItems.pop();
			}
		}
		
		var command = new ModifyCommand(widget, this.getProperties(widget, values), popupMenuBarItems);
		this._getContext().getCommandStack().execute(command);
		return command.newWidget;
	},
	
	createPopupMenuBarItemData: function(value) {
		return { 
			type: "dijit/PopupMenuBarItem", 
			properties: { label: value }, 
			children: [
				{	type: "dijit/Menu",  
					children: [
						//{type:"dijit/MenuItem", properties:{ label: "Menu Item 1" }},
						//{type:"dijit/MenuItem", properties:{ label: "Menu Item 2" }}
					]
				}
			]
		};
	},
	
	createMenuItemData: function(value) {
		return { 
			type: "dijit/MenuItem", 
			properties: { label: value }
		};
	},

	getProperties: function(widget, values) {
		return null;
	},
	
	parse: function(input) {
		var result = this.parseItems(entities.decode(input));
		// i think we need to re-encode the result.text here
		if (this._format === 'text'){
			for (var i=0; i < result.length; i++){
				result[i].text = entities.encode(result[i].text );
			}
		}
		return result;
	}

});

});
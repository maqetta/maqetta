dojo.provide("davinci.ve.actions.ChildActions");

dojo.require("davinci.actions.Action");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.ModifyCommand");
dojo.require("davinci.ve.commands.MoveCommand");

dojo.declare("davinci.ve.actions.AddPaneAction", davinci.actions.Action, {

	name: "addPane",
	iconClass: "editActionIcon editAddPaneIcon",

	run: function(context){
		if(!context){
			return;
		}
		var container = this._getContainer(context);
		if(!container){
			return;
		}

		var type = undefined;
		var modify = false;
		switch(container.declaredClass){
		case "dojox.layout.RadioGroup":
			type = "dijit.layout.ContentPane";
			modify = true;
			break;
		case "dojox.widget.WizardContainer":
			type = "dojox.widget.WizardPane";
			break;
		default:
			type = "dijit.layout.ContentPane";
			break;
		}
		if(!context.loadRequires(type)){
			return;
		}

		var data = {type: type, properties: {title: "Pane"}};
		var command = undefined;
		if(modify){
			var childrenData = [];
			dojo.forEach(davinci.ve.widget.getChildren(container), function(c){
				var d = davinci.ve.widget.getData(c);
				childrenData.push(d);
			});
			childrenData.push(data);
			command = new davinci.ve.commands.ModifyCommand(container, undefined, childrenData);
		}else{ // add
			command = new davinci.ve.commands.AddCommand(data, container);
		}
		context.getCommandStack().execute(command);
	},

	isEnabled: function(context){
		return !!(context && this._getContainer(context));
	},

	_getContainer: function(context){
		var selection = context.getSelection();
		if(selection.length === 0){
			return undefined;
		}
		var widget = selection[selection.length - 1];
		while(widget && widget != context.container){
			if(widget.isLayoutContainer && widget.declaredClass != "dojox.layout.ScrollPane"){
				return widget;
			}
			widget = davinci.ve.widget.getParent(widget); 
		}
		return undefined;
	}

});

dojo.declare("davinci.ve.actions.AddMenuItemAction", davinci.actions.Action, {

	name: "addMenuItem",
	iconClass: "editActionIcon editAddMenuItemIcon",

	run: function(context){
		if(!context){
			return;
		}
		var menu = this._getMenuWidget(context);
		if(!menu){
			return;
		}
	    var data = {type: "dijit.MenuItem", properties: {label: "Menu Item"}};
		var command = new davinci.ve.commands.AddCommand(data, menu);
		context.getCommandStack().execute(command);
	},

	isEnabled: function(context){
		return !!(context && this._getMenuWidget(context));
	},
	
	_getMenuWidget: function(context){
		var selection = context.getSelection();
		if(selection.length === 0){
			return undefined;
		}
		var widget = selection[selection.length - 1];
		if(widget.declaredClass === "dijit.Menu"){
			return widget;
		}else if(widget.declaredClass === "dijit.MenuItem"){
			return davinci.ve.widget.getParent(widget);
		}else if(widget.declaredClass === "dijit.PopupMenuItem"){
			return widget;
		}else{
			return undefined;
		}
	}
});

dojo.declare("davinci.ve.actions.AddMenuBarItemAction", davinci.actions.Action, {

	name: "addMenuBarItem",
	iconClass: "editActionIcon editAddMenuItemIcon",
	
	run: function(context){
		if(!context){
			return;
		}
		console.log("voila! it also came here!");
		var menuBar = this._getMenuBarWidget(context);
		if(!menuBar){
			return;
		}
		var command = new davinci.ve.commands.AddCommand({
			type:"dijit.MenuBarItem",
			properties: {label: "MenuBar Item"}
		},menuBar);
		context.getCommandStack().execute(command);
	},
	
	isEnabled: function(context){
		return !! (context && this._getMenuBarWidget(context));
	},
	
	_getMenuBarWidget: function(context){
		var selection = context.getSelection();
		if(selection.length === 0){
			return undefined;
		}
		var widget = selection[selection.length - 1];
		if(widget.declaredClass === "dijit.MenuBar"){
			return widget;
		}else{
			return undefined;
		}
	}
});


dojo.declare("davinci.ve.actions.AddSubMenuAction", davinci.actions.Action, {

	name: "addSubMenu",
	iconClass: "editActionIcon editAddSubMenuIcon",

	run: function(context){
		if(!context){
			return;
		}
		var menu = this._getMenuWidget(context);
		if(!menu){
			return;
		}
		var command = new davinci.ve.commands.AddCommand({
			type: "dijit.PopupMenuItem", 
			properties: {label:"Sub Menu"},
			children: [
				{type: "dijit.Menu", 
					children: [{type: "dijit.MenuItem", properties: {label: "Sub Menu Item"}}]
				}
			]
		}, menu	);
		context.getCommandStack().execute(command);
	},

	isEnabled: function(context){
		return !!(context && this._getMenuWidget(context));
	},
	
	_getMenuWidget: function(context){
		var selection = context.getSelection();
		if(selection.length === 0){
			return undefined;
		}
		var widget = selection[selection.length - 1];
		if(widget.declaredClass === "dijit.Menu"){
			return widget;
		}else if(widget.declaredClass === "dijit.MenuItem"){
			return davinci.ve.widget.getParent(widget);
		}else{
			return undefined;
		}
	}
});

dojo.declare("davinci.ve.actions.AddPopupMenuBarAction", davinci.actions.Action, {
	
	name: "addPopupMenuBar",
	iconClass: "editActionIcon editAddSubMenuIcon",
	
	run: function(context){
		if(!context)
			return;
		var menuBar = this._getMenuBarWidget(context);
		if(!menuBar)
			return;
		var command = new davinci.ve.commands.AddCommand({
			type: "dijit.PopupMenuBarItem", 
			properties: {label: "Menubar"},
			children: [
				{type: "dijit.Menu", 
					children: [{type: "dijit.MenuItem", properties: {label: "Menu Item"}}]
				}
			]
		}, menuBar);
		context.getCommandStack().execute(command);
	},
	
	isEnabled: function(context) {
		return !!(context && this._getMenuBarWidget(context));
	},
	
	_getMenuBarWidget: function(context){
		var selection = context.getSelection();
		if(selection.length === 0){
			return undefined;
		}
		var widget = selection[selection.length - 1];
		if(widget.declaredClass === "dijit.MenuBar"){
			return widget;
		}else{
			return undefined;
		}
	}
});



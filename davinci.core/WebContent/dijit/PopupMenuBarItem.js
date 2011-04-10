dojo.provide("dijit.PopupMenuBarItem");

dojo.require("dijit.PopupMenuItem");
dojo.require("dijit.MenuBarItem");

dojo.declare("dijit.PopupMenuBarItem", [dijit.PopupMenuItem, dijit._MenuBarItemMixin], {
	// summary:
	//		Item in a MenuBar like "File" or "Edit", that spawns a submenu when pressed (or hovered)
});


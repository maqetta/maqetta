dojo.provide("dijit.MenuBarItem");

dojo.require("dijit.MenuItem");

dojo.declare("dijit._MenuBarItemMixin", null, {
	templateString: dojo.cache("dijit", "templates/MenuBarItem.html"),

	// overriding attributeMap because we don't have icon
	attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
		label: { node: "containerNode", type: "innerHTML" }
	})
});

dojo.declare("dijit.MenuBarItem", [dijit.MenuItem, dijit._MenuBarItemMixin], {
	// summary:
	//		Item in a MenuBar that's clickable, and doesn't spawn a submenu when pressed (or hovered)

});
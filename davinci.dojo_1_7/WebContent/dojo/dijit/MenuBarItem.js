define([
	"dojo",
	".",
	"dojo/text!./templates/MenuBarItem.html",
	"./MenuItem"], function(dojo, dijit, template){

	// module:
	//		dijit/MenuBarItem
	// summary:
	//		Item in a MenuBar that's clickable, and doesn't spawn a submenu when pressed (or hovered)


	dojo.declare("dijit._MenuBarItemMixin", null, {
		templateString: template,

		// Map widget attributes to DOMNode attributes.
		_setIconClassAttr: null	// cancel MenuItem setter because we don't have a place for an icon
	});

	dojo.declare("dijit.MenuBarItem", [dijit.MenuItem, dijit._MenuBarItemMixin], {
		// summary:
		//		Item in a MenuBar that's clickable, and doesn't spawn a submenu when pressed (or hovered)

	});


	return dijit.MenuBarItem;
});

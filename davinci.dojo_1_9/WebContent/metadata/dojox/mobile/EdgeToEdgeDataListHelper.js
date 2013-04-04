define([
	"dojo/_base/declare",
	"dojo/query",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/RemoveCommand",
	"../../dojo/data/DataStoreBasedWidgetHelper",
	"./InitialSizeHelper"
], function (
	declare,
	query,
	Widget,
	CompoundCommand,
	RemoveCommand,
	DataStoreBasedWidgetHelper,
	InitialSizeHelper
) {

return declare([InitialSizeHelper, DataStoreBasedWidgetHelper], {
	
	create: function(widget, srcElement) {
		this.stopOnClickListItems(widget);
	},
	
	stopOnClickListItems: function(widget){
		var dijitWidget = widget.dijitWidget;
		if(dijitWidget && dijitWidget.containerNode){
			// Fix for #753.
			// The ListItem widget's startup logic registers an onclick
			// handler, and if the 'moveTo' property has a reference to a view,
			// then this built-in onclick handler will launch an animated
			// transition to make that view visible. This is good for runtime execution,
			// but we don't want this onclick handler to execute in the page editor.
			// So, register a "click" handler in the capture phase (happens before default bubble phase)
			// that calls stopPropagation(), which prevents the ListItem's onclick logic from getting invoked.
			// This allows event to bubble up to ancestor widgets, and therefore
			// will be caught by Maqetta and will cause a selection action to occur.
			query(".mblListItemAnchor", dijitWidget.containerNode).forEach(function(node, index, arr){
				node.addEventListener("click",function(e){
					e.stopPropagation();		
				}, true);
			});
		}
	}

});

});
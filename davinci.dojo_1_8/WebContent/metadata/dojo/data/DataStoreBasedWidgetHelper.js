define([
	"dojo/_base/declare",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/RemoveCommand",
	"./DataStoreBasedWidgetInput"
], function (
	declare,
	Widget,
	CompoundCommand,
	RemoveCommand,
	DataStoreBasedWidgetInput
) {

return declare(null, {

	getData : function(/* Widget */widget, /* Object */options) {
		if (!widget) {
			return undefined;
		}

		// call the old _getData
		var data = widget._getData(options);

		if (widget.dijitWidget.store) {
			// add the data old store if it has one.
			data.properties.store = widget.dijitWidget.store; 
			data.properties.query = widget.dijitWidget.query;
		}
		return data;
	},

	preProcessData : function(data) {
		var store = data.properties.store;
		var storeId = store.id ? store.id : store._edit_object_id;
		if (storeId) {
			var store = data.context.getDojo().getObject(storeId);
			if (store) {
				data.properties.store = store;
			}
		}

		return data;
	},

	/*
	 * Called by DeleteAction when widget is deleted. @param
	 * {davinci.ve._Widget} widget Widget that is being deleted @return
	 * {davinci.commands.CompoundCommand} command that is to be added to the
	 * command stack.
	 * 
	 * This widget has a data store widget that is associated with it and
	 * must be deleted also.
	 */
	getRemoveCommand : function(widget, useDataDojoProps) {
		var command = new CompoundCommand();
		var storeId = DataStoreBasedWidgetInput.getStoreId(widget, useDataDojoProps);
		var storeWidget = Widget.byId(storeId);
		// order is important for undo...
		command.add(new RemoveCommand(widget));
		command.add(new RemoveCommand(storeWidget));
		return command;
	},
	
	/*
	 * In same cases we are handling certain attributes within data-dojo-props 
	 * or via child HTML elements, and we do not want to allow those attributes 
	 * to be written out into the final HTML. So, here, we clean out those
	 * attributes.
	*/
	cleanSrcElement: function(srcElement, useDataDojoProps) {
		if (useDataDojoProps) {
			srcElement.removeAttribute("store");
		} else {
			//The actual store object sometimes finds it's way into the source 
			//element, and we really need the id to be written out to the HTML source
			//instead of the string "[Object]"
			var store = srcElement.getAttribute("store");
			if (store && store.id) {
				srcElement.setAttribute("store", store.id);
			}
		}
	}

});

});
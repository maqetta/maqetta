define([
	"dojo/query",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/RemoveCommand"
], function (
	query,
	Widget,
	CompoundCommand,
	RemoveCommand
) {

var CarouselHelper = function() {};
CarouselHelper.prototype = {

	getData: function(/*Widget*/ widget, /*Object*/ options) {
		if(!widget){
			return undefined;
		}
	
		// call the old _getData
		var data = widget._getData(options);

		if (widget.dijitWidget.store){
			data.properties.store = widget.dijitWidget.store; // add the data old store if it has one.
			data.properties.query = widget.dijitWidget.query;
		}
		return data;
	},

	preProcessData: function(data){

	  if (data.properties.store._edit_object_id) {
	    var store = data.context.getDojo().getObject(data.properties.store._edit_object_id);
	    if (store) {
	      data.properties.store = store;
	    }
	  }

		return data;
	},
	
	/*
	 * Called by DeleteAction when widget is deleted.
	 * @param {davinci.ve._Widget} widget  Widget that is being deleted
	 * @return {davinci.commands.CompoundCommand}  command that is to be added to the command stack.
	 * 
	 * This widget has a data store widget that is associated with it and must be deleted also.
	 */
	getRemoveCommand: function(widget) {
		
		var command = new CompoundCommand();
		var storeId = widget._srcElement.getAttribute("store");
		var storeWidget = Widget.byId(storeId);
		// order is important for undo... 
		command.add(new RemoveCommand(widget));
		command.add(new RemoveCommand(storeWidget));
		return command;
		
	}

};

return CarouselHelper;

});

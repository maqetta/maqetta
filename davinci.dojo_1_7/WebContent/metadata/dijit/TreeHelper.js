define(["davinci/ve/widget",
		"davinci/ve/commands/RemoveCommand",
		"davinci/commands/CompoundCommand"
		],
function(Widget, RemoveCommand, CompoundCommand){

var TreeHelper = function() {};
TreeHelper.prototype = {

	/*
	 * Called by DeleteAction when widget is deleted.
	 * @param {davinci.ve._Widget} widget  Widget that is being deleted
	 * @return {davinci.commands.CompoundCommand}  command that is to be added to the command stack.
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be deleted also.
	 */
	getRemoveCommand: function(widget) {
		
		var command = new CompoundCommand();
		var modelId = widget.domNode._dvWidget._srcElement.getAttribute("model");
		var modelWidget = Widget.byId(modelId);
		var storeId = modelWidget._srcElement.getAttribute("store");
		var storeWidget = Widget.byId(storeId);
		// order is important for undo... 
		command.add(new RemoveCommand(widget));
		command.add(new RemoveCommand(modelWidget));
		command.add(new RemoveCommand(storeWidget));
		return command;
		
	}

};

return TreeHelper;

});
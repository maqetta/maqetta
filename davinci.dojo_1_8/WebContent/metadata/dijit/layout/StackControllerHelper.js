define([
	"dojo/_base/declare",
	"./LayoutContainerHelper",
	"davinci/ve/widget",
	"davinci/ve/commands/RemoveCommand",
	"davinci/commands/CompoundCommand"
], function(
	declare,
	LayoutContainerHelper,
	Widget,
	RemoveCommand,
	CompoundCommand
) {

return declare(LayoutContainerHelper, {
	/*
	 * Called by DeleteAction when widget is deleted.
	 * @param {davinci.ve._Widget} widget  Widget that is being deleted
	 * @return {davinci.commands.CompoundCommand}  command that is to be added to the command stack.
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be deleted also.
	 */
	getRemoveCommand: function(widget) {
		var command = new CompoundCommand();

		var widgetId = widget.getId();
		var stackContainer = Widget.byId(widget.getData().properties.containerId);

		// Remove the main widget first as we need to add it first for undo, as the
		// stackcontroller needs to have access to the widget
		command.add(new RemoveCommand(stackContainer));

		command.add(new RemoveCommand(widget));

		return command;
	}
});
});

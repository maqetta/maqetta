define([
	"dojo/_base/declare",
	"./LayoutContainerHelper",
	"davinci/ve/widget",
	"davinci/ve/commands/RemoveCommand",
	"davinci/ve/commands/ReparentCommand",
	"davinci/commands/CompoundCommand"
], function(
	declare,
	LayoutContainerHelper,
	Widget,
	RemoveCommand,
	ReparentCommand,
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

		// Remove the main widget first as we need to add it first for undo, as the
		// stackcontroller needs to have access to the widget
		command.add(new RemoveCommand(widget));

		var widgetId = widget.getId();
		var siblings = widget.getParent().getChildrenData();

		dojo.forEach(siblings, function(w) {
			if (w.type == "dijit/layout/StackController" && w.properties.containerId == widgetId) {
				command.add(new RemoveCommand(Widget.byId(w.properties.id)));
			}
		})

		return command;
	},

	/*
	 * Called by Reparent command when widget is reparented.
	 * @param {davinci.ve._Widget} widget  Widget that is being reparentted
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be reparented also.
	 */
	reparent: function(widget){ 
		try {
			var widgetId = widget.getId();

			var controllers = this._getAllStackControllersForWidget(widget);
	
			dojo.forEach(controllers, function(w) {
				this._reparentWidget(widget, w);
			}.bind(this));
		} catch (e) {
			console.error('StackContainerHelper.Reparent error processing tree.');
		}
	},

	/*
	 * Called  to reparent the widget
	 * @param {davinci.ve._Widget} widget  Widget that is being created
	 * @param {davinci.ve._Widget} widget associated with parm 1 StackContainer
	 * 
	 */
	_reparentWidget: function(widget, assocatedWidget) {
		var parent = widget.getParent();
		var assocatedParent = assocatedWidget.getParent();
		var newIndex = (parent.indexOf(widget) < 1) ? 0 : parent.indexOf(widget)-1;
		var i = parent.indexOf(widget);
		var x = assocatedParent.indexOf(assocatedWidget);
		if ((parent === assocatedParent) && (i < x )){ // same parent
			newIndex = parent.indexOf(widget);
		} else if (parent != assocatedParent) {
			newIndex = i;
		}
		var command = new ReparentCommand(assocatedWidget, parent, newIndex);
		command.execute();
	},

	_getAllStackControllersForWidget: function(widget) {
		var controllers = dojo.query(".dijitStackController", widget.getContext().getDocument());

		var widgets = [];

		dojo.forEach(controllers, function(controller) {
			if (controller._dvWidget && controller._dvWidget.getData().properties.containerId == widget.getId()) {
				widgets.push(controller._dvWidget);
			}
		});

		return widgets;
	}
});
});
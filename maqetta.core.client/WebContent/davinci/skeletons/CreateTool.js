/**
 * THIS FILE IS FOR REFERENCE/DOCUMENTATION ONLY.  Do not use directly, but feel
 * free to copy for use, update and strip out the unnecessary functions.
 */

define([
    "dojo/_base/declare",
    "davinci/ve/tools/CreateTool",
    "davinci/ve/widget",
	"davinci/ve/commands/AddCommand",
	"davinci/commands/CompoundCommand",
], function (
    declare,
    CreateTool,
    Widget,
    AddCommand,
    CompoundCommand
) {

return declare(CreateTool, {

    /**
     * Calculates  {parent: parent, index: index, position: position, size: args.size} 
     * which are then passed to _create. 
     * 
     * The user would override this method to change the default 
     * method that determines the values passed to _create.
     * 
     * @param  {Object} args: 
     * 		args.directTarget, 
     * 		args.index - the index at which to add this child to the parent, 
     * 		args.size - size of the widget being created {height, width}, 
     * 		args.target - widget to be created
     * @return {[null]}  
     */
    create: function(args) {
    	
//	Example:
//    	/*
//    	 * Ensure we have the information needed to create the widget
//    	 */
//    	if(!args || !this._data){
//			return;
//		}
//    	/*
//    	 * Locate the parent to use for the widget we are about to create
//    	 */
//		var parent = args.target,
//			parentNode, child;
//		while (parent) {
//			parentNode = parent.getContainerNode();
//			if (parentNode) { // container widget
//				break;
//			}
//			child = parent; // insert before this widget for flow layout
//			parent = parent.getParent();
//		}
//		/*
//		 * Locate the index at which we want to add the widget we are about to create to the parent
//		 */
//		var index = args.index;
//		/*
//		 * Determine the position we want for the widget we are about.
//		 */
//		var position = args.position;
//		/*
//		 * Ensure the context is correct
//		 */
//		this._data.context=this._context;
//		/*
//		 * Now call the method to create the widget
//		 */
//		this._create({parent: parent, index: index, position: position, size: args.size});			
    },

    /**
     * Creates the widget
     * @param  {Object} args 
     * 		args.parent - the parent of the widget being created, 
     * 		args.index - the index at which to add this child to the parent,
     * 		args.position - relative to parent, 
     * 		args.size - size of the widget being created {height, width}
     * @return {[null]}      [description]
     */
    _create: function(args) {
	
//	Example:
//		/*
//		 * Check that we have data to use to create the widget
//		 */
//		if(this._data.length !== 1){
//			return;
//		}
//		var widgetData = this._data[0];
//		/*
//		 * Add the required modules for the widgets
//		 */
//		if(!this._context.loadRequires(widgetData.type,true)){
//			return;
//		}
//
//		/*
//		 *  Ensure that the widgetData has properties object
//		 */		
//		if(!widgetData.properties){
//			widgetData.properties = { };
//		}
//		/*
//		 *  widgetData must have the correct context to be used when creating the temporary
//		 *  that will latter be passed to the command stack 
//		 */
//		widgetData.context = this._context;
//		var widget;
//		var dj = this._context.getDojo();
//		dojo.withDoc(this._context.getDocument(), function(){
//			widget = Widget.createWidget(widgetData); // creates temp widget
//		});
//		if(!widget){
//			return;
//		}
//		/*
//		 *  Create a CompoundCommand for use to add, postions, size and style the widget
//		 *  The Command is needed to enable the undo redo feature of Maqetta
//		 */
//		var command = new CompoundCommand();
//		var index = args.index;
//		/*
//		 * Add the widget to the CompondComand
//		 */
//		command.add(new AddCommand(widget, args.parent, index));
//		/*
//		 * Add move command if needed to the CompoundCommand 
//		 */
//		if(args.position){
//			command.add(new MoveCommand(widget, args.position.x, args.position.y));
//		}
//		args.size = this._getInititalSize(widget, args);
//		/*
//		 * Add Resize if needed to CompoundCommand
//		 */
//		if(args.size){
//			command.add(new ResizeCommand(widget, args.size.w, args.size.h));
//		}
//		/*
//		 * Now this is where we actually add the widget,
//		 * The following adds the CompoundCommand to the CommandStack (undo/redo) and executes the 
//		 * command.
//		 */
//		this._context.getCommandStack().execute(command);

    }
});

});
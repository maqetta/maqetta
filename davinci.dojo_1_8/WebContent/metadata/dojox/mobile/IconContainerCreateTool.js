define([
    "dojo/_base/declare",
    "dojo/_base/window",
    "dojo/promise/all",
    "davinci/ve/tools/CreateTool",
    "davinci/ve/widget",
    "davinci/commands/CompoundCommand",
    "davinci/ve/commands/AddCommand",
    "davinci/ve/commands/StyleCommand",
    "davinci/ve/commands/MoveCommand",
    "davinci/ve/commands/ResizeCommand"
], function (
    declare,
    Window,
    all,
    CreateTool,
    Widget,
    CompoundCommand,
    AddCommand,
    StyleCommand,
    MoveCommand,
    ResizeCommand
) {

/**
 * GitHub #801
 *  The Dojo parser first instantiates a Dijit and then instantiates its
 * children. However, currently, the Maqetta code instantiates the children
 * *first* and then the parent. This is a problem with IconContainer and its
 * children IconItem. During the rendering step, IconItem pulls in params
 * from its parent. However, when an IconContainer is first added to the page
 * in Maqetta, the code first instantiates IconItem, so it doesn't have a parent
 * and doesn't properly pull in the 'iconBase' param. This code fixes that by
 * first instantiating IconContainer and then its children IconItem.
 */

return declare(CreateTool, {

    _create: function(args) {

        var iconContainerData = this._data[0],
            childrenData = iconContainerData.children,
            context = this._context;

        // will deal with its children later
        delete iconContainerData.children;

        // load required resources for IconContainer and children
        all(childrenData.concat(iconContainerData).map(function(obj) {
            return context.loadRequires(obj.type, true);
        }, this)).then(function() {
	        iconContainerData.context = context;
	        var iconContainer;
	        Window.withDoc(context.getDocument(), function() {
	            iconContainer = Widget.createWidget(iconContainerData);
	        });
	        if (! iconContainer) {
	            return;
	        }
	
	        var command = new CompoundCommand();
	
	        // first add parent IconContainer...
	        command.add(new AddCommand(iconContainer,
	                args.parent, args.index));
	        
			// If preference says to add new widgets to the current custom state,
			// then add appropriate StyleCommands
			CreateTool.prototype.checkAddToCurrentState(command, iconContainer);	

			// ... followed by its children
	        childrenData.forEach(function(child, idx) {
                child.context = context;
                command.add(new AddCommand(child, iconContainer,
	                    idx));
            });
	
	        if (args.position) {
				var absoluteWidgetsZindex = context.getPreference('absoluteWidgetsZindex');
				command.add(new StyleCommand(iconContainer, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
	            command.add(new MoveCommand(iconContainer,
	                    args.position.x, args.position.y));
	        }
	        if (args.size) {
	            var w = args.size && args.size.w,
	                h = args.size && args.size.h;
	            command.add(new ResizeCommand(iconContainer, w, h));
	        }
	        context.getCommandStack().execute(command);
	        this._select(iconContainer);
	        return iconContainer; //TODO: is return value used?
        }.bind(this));
    }
});

});
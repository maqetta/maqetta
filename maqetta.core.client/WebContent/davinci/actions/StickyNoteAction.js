define([
        "dojo/_base/declare",
    	"./Action",
    	"../Workbench",
    	"davinci/commands/CompoundCommand",
    	"../ve/commands/AddCommand",
    	"../ve/commands/MoveCommand",
    	"../ve/commands/ResizeCommand",
    	"../ve/tools/CreateTool",
    	"../ve/widget",
    	"../ve/metadata"
], function(declare, Action, Workbench, CompoundCommand, AddCommand, MoveCommand, ResizeCommand, CreateTool, widgetUtils, Metadata){

return declare("davinci.actions.StickyNoteAction", Action, {

	run: function(selection){

		var e = Workbench.getOpenEditor();
		var descriptor = davinci.ve.metadata.queryDescriptor("html.stickynote");
		if (!descriptor) {
			return;
		}
		var data = dojo.clone(descriptor);
		data.context = e.getContext();
		if (e && e.getContext){
	
			var widget = undefined;
			dojo.withDoc(e.getContext().getDocument(), function(){
				widget = widgetUtils.createWidget(data);
			}/*, this*/);
			if(!widget){
				return;
			}
	
			var command = new CompoundCommand();
			var doc = e.getContext().getDocument();
			var parent = doc.body;
			var container = e.getContext().getContainerNode();
			command.add(new AddCommand(widget,
					/* args.parent ||*/ e.getContext().getContainerNode()/*,*/
				 /*args.index*/));
			
			// If preference says to add new widgets to the current custom state,
			// then add appropriate StyleCommands
			CreateTool.prototype.checkAddToCurrentState(command, widget);
	
//			if(args.position){
//				command.add(new MoveCommand(widget, args.position.x, args.position.y));
			command.add(new MoveCommand(widget, 50, 50));
//			}
			if(/*args.size || */widget.isLayoutContainer){
				// For containers, issue a resize regardless of whether an explicit size was set.
				// In the case where a widget is nested in a layout container,
				// resize()+layout() will not get called during create. 
				var w = args.size && args.size.w,
					h = args.size && args.size.h;
				command.add(new ResizeCommand(widget, w, h));
			}
			
			e.getContext().getCommandStack().execute(command);
			Metadata.getSmartInput(widget.type).then(function(inlineEdit){			
				if (inlineEdit && inlineEdit.displayOnCreate) {
					e.getContext().select(widget, null, true); // display inline
				} else {
					e.getContext().select(widget); // no inline on create
				}
			}.bind(this));

		}

	},
	
	isEnabled: function(selection){
		var e = Workbench.getOpenEditor();
		return (e && e.getContext);
	}
});
});

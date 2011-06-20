dojo.provide("davinci.actions.StickyNoteAction");
dojo.require("davinci.actions.Action");
dojo.require("davinci.resource");
dojo.require("davinci.ve.commands.AddCommand");


dojo.declare("davinci.actions.StickyNoteAction", davinci.actions.Action, {
	
	run: function(selection){

		var e = davinci.Workbench.getOpenEditor();
		var descriptor = davinci.ve.metadata.queryDescriptor("html.stickynote");
		if (!descriptor) {
			return;
		}
		var data = dojo.clone(descriptor);
		data.context = e.getContext();
		if (e && e.getContext){
	
			var widget = undefined;
			dojo.withDoc(e.getContext().getDocument(), function(){
				widget = davinci.ve.widget.createWidget(data);
			}/*, this*/);
			if(!widget){
				return;
			}
	
			var command = new davinci.commands.CompoundCommand();
			var doc = e.getContext().getDocument();
			var parent = doc.body;
			var container = e.getContext().getContainerNode();
			command.add(new davinci.ve.commands.AddCommand(widget,
					/* args.parent ||*/ e.getContext().getContainerNode()/*,*/
				 /*args.index*/));
	
//			if(args.position){
//				command.add(new davinci.ve.commands.MoveCommand(widget, args.position.x, args.position.y));
			command.add(new davinci.ve.commands.MoveCommand(widget, 50, 50));
//			}
			if(/*args.size || */widget.isLayoutContainer){
				// For containers, issue a resize regardless of whether an explicit size was set.
				// In the case where a widget is nested in a layout container,
				// resize()+layout() will not get called during create. 
				var w = args.size && args.size.w,
					h = args.size && args.size.h;
				command.add(new davinci.ve.commands.ResizeCommand(widget, w, h));
			}
			e.getContext().getCommandStack().execute(command);
			var inLineEdit = davinci.ve.metadata.queryDescriptor(widget.type, "inlineEdit");
			if (inLineEdit && inLineEdit.displayOnCreate && inLineEdit.displayOnCreate.toLowerCase() == 'true') {
				e.getContext().select(widget,null,true); // display inline
			} else {
				e.getContext().select(widget); // no inline on create
			}
		}

	},
	
	isEnabled: function(selection){
		var e = davinci.Workbench.getOpenEditor();
		if (e && e.getContext)
	//	if (e.declaredClass == 'davinci.themeEditor.ThemeEditor') // this is a hack to only support undo for theme editor for 0.5
			return (e.getContext().getCommandStack().canRedo());
		else return false;
		//	return davinci.Runtime.commandStack.canRedo();
	}
}
);

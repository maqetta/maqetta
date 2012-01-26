define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/ContextAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/commands/ReparentCommand",
    	"davinci/ve/widget"
], function(declare, ContextAction, CompoundCommand, AddCommand, ReparentCommand, Widget){


return declare("davinci.ve.actions.AddTableRow", [ContextAction], {

	run: function(context){
		context = this.fixupContext(context);
		var newWidget;
		dojo.withDoc(context.getDocument(), function(){
			newWidget = Widget.createWidget({type: "html.div", properties: {}, children: []});
		});
		var parent = context.getSelection()[0].getParent();
		var command = new CompoundCommand();
		command.add(new AddCommand(newWidget,parent,0));
		dojo.forEach(context.getSelection(), function(w){
			command.add(new ReparentCommand(w, newWidget, "last"));
		});
		context.getCommandStack().execute(command);
	},
	shouldShow: function(context){
		context = this.fixupContext(context);
		var selection = context.getSelection();
		var type = selection && selection.length == 1 && selection[0].type;
		var show = false;
		switch (type) {
			case "html.td":
			case "html.tr":
			case "html.tbody":
			case "html.table":
			case "html.th":
				show = true;
		}
		return show;
	},
	isEnabled: function(context){
		return true;
	}
});
});

define(["dojo/_base/declare",
    	"davinci/ve/tools/CreateTool",
    	"davinci/ve/widget",
    	"davinci/ve/metadata",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/commands/MoveCommand"], function(
    		declare,
			CreateTool,
			widget,
			metadata,
			CompoundCommand,
			AddCommand,
			MoveCommand
			){

return declare("davinci.ve.tools.PasteTool", CreateTool, {

	_create: function(args){
		var index = args.index,
			baseline;
		dojo.forEach(this._data, function(d){
			var loadRequiresForTree = dojo.hitch(this, function(d){
				if(d.type){ // structure has plain 'string' nodes which don't have type or children
					if(d.children && d.children instanceof Array){ // sometimes children is just a string also
						d.children.forEach(loadRequiresForTree, this);
					}
					if(!this._context.loadRequires(d.type, true, true)){
						throw "Failed to load dependencies for " + d.type;
					}
				}
			});
			
			loadRequiresForTree(d);

			var position, style = widget.parseStyleValues((d.properties && d.properties.style));
			if(style && style.position == "absolute"){
				if(args.position){
					var p = {x: (parseInt(style.left) || 0), y: (parseInt(style.top) || 0)};
					if(baseline){
						position = {x: args.position.x + p.x - baseline.x,
							y: args.position.y + p.y - baseline.y};
					}else{
						position = args.position;
						baseline = p;
					}
				}else{
					// FIXME: these aren't used?
					// unset position style values
					style.position = undefined;
					style.left = undefined;
					style.top = undefined;
				}
			}

			dojo.withDoc(this._context.getDocument(), function(){
				d.context = this._context;
				metadata.getHelper(d.type, "tool").then(function(ToolCtor) {
					var w,
						myTool,
						selection = [],
						command = new CompoundCommand();

					if (ToolCtor) {
				    	myTool = new ToolCtor(d);
			        }
			        if (myTool && myTool.addPasteCreateCommand) {
			        	var myArgs = {
			        		parent: args.parent || this._context.getContainerNode(),
			        		position: position,
			        		index: index
			        	};
			        	w = myTool.addPasteCreateCommand(command,myArgs);
			        	if (!w) {
							return;
						}
			        } else {
			        	w = widget.createWidget(d);
			        	if (!w) {
							return;
						}
			        	command.add(new AddCommand(w, args.parent || this._context.getContainerNode(), index));
			        }

			        if (index !== undefined && index >= 0) {
						index++;
					}
					if (position) {
						command.add(new MoveCommand(w, position.x, position.y));
					}

					selection.push(w);

					if(!command.isEmpty()){
						this._context.getCommandStack().execute(command);
						dojo.forEach(selection, function(w, i){
							this._context.select(w, i > 0);
						}, this);
					}
				}.bind(this));
			}, this);
		}, this);
	}
});
});

dojo.provide("davinci.ve.tools.PasteTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.ve.tools.PasteTool", davinci.ve.tools.CreateTool, {

	_create: function(args){
		var command = new davinci.commands.CompoundCommand(),
			index = args.index,
			baseline,
			selection = [];
		dojo.forEach(this._data, function(d){
			var loadRequiresForTree = dojo.hitch(this, function(d){
				if(d.children){
					d.children.forEach(loadRequiresForTree, this);
				}
				if(!this._context.loadRequires(d.type)){
					throw "Failed to load dependencies for " + d.type;
				}				
			});
			
			loadRequiresForTree(d);

			var position, style = davinci.ve.widget.parseStyleValues((d.properties && d.properties.style));
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
					// unset position style values
					style.position = undefined;
					style.left = undefined;
					style.top = undefined;
				}
			}

			var widget = undefined;
			dojo.withDoc(this._context.getDocument(), function(){
				d.context=this._context;
				var tool = davinci.ve.metadata.queryDescriptor(d.type, "tool");
				var myTool;
			    if (tool) {
			        try {
			            dojo["require"](tool);
			        } catch(e) {
			            console.error("Failed to load tool: " + tool);
			            console.error(e);
			        }
			        var aClass = dojo.getObject(tool);
			        if (aClass) {
			        	myTool  = new aClass(d);
					}
			       // var obj = dojo.getObject(tool);
			        //myTool = new obj();
		        }
		        if(myTool && myTool.addPasteCreateCommand){
		        	var myArgs = {};
		        	myArgs.parent = args.parent || this._context.getContainerNode();
		        	myArgs.position = position;
		        	myArgs.index = index;
		        	widget =  myTool.addPasteCreateCommand(command,myArgs);
		        	if(!widget){
						return;
					}
		        } else {
		        	widget = davinci.ve.widget.createWidget(d);
		        	if(!widget){
						return;
					}
		        	command.add(new davinci.ve.commands.AddCommand(widget, args.parent || this._context.getContainerNode(), index));
		        }
		    					
				if(index !== undefined && index >= 0){
					index++;
				}
				if(position){
					command.add(new davinci.ve.commands.MoveCommand(widget, position.x, position.y));
				}

				
			}, this);
			if(!widget){
				return;
			}

			selection.push(widget);
		}, this);

		if(!command.isEmpty()){
			this._context.getCommandStack().execute(command);
			dojo.forEach(selection, function(w, i){
				this._context.select(w, i > 0);
			}, this);
		}
	}

});

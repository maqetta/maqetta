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
		
		// Looks for a particular property within styleArray
		function retrieveProperty(styleArray, propName, defaultValue){
			var propValue = defaultValue;
			if(styleArray && styleArray.length>0){
				styleArray.forEach(function(o){	// Should be only one property per object
					if(o.hasOwnProperty(propName)){
						propValue = o[propName];
					}
				});
			}
			return propValue;
		}
		
		var index = args.index,
			baseline,
			delta;
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

			var position, styleArray = widget.parseStyleValues((d.properties && d.properties.style));
			var position_prop = retrieveProperty(styleArray, 'position', '');
			if(position_prop == "absolute"){
				if(args.position){
					var left = parseInt(retrieveProperty(styleArray, 'left', '0px'));
					var top = parseInt(retrieveProperty(styleArray, 'top', '0px'));
					if(delta){
						position = {x: left + delta.x,
							y: top + delta.y};
					}else{
						position = args.position;
						delta = {x:args.position.x - left, y:args.position.y - top};
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

define(["dojo/_base/declare",
    	"davinci/ve/tools/CreateTool",
    	"davinci/ve/widget",
    	"davinci/ve/metadata",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/commands/MoveCommand",
    	"davinci/ve/commands/StyleCommand"], function(
    		declare,
			CreateTool,
			widget,
			metadata,
			CompoundCommand,
			AddCommand,
			MoveCommand,
			StyleCommand
			){

return declare("davinci.ve.tools.PasteTool", CreateTool, {

	constructor: function(data) {
		this.inherited(arguments);
		this._position_prop = null;
		var d = data[0];
		if(d && d.properties){
			var styleArray = widget.parseStyleValues(d.properties.style);
			this._position_prop = this._retrieveProperty(styleArray, 'position', '');
		}
	},
	
	_create: function(args){
		var index = args.index,
			baseline,
			delta,
			position;
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

			var styleArray = widget.parseStyleValues((d.properties && d.properties.style));
			if(this._position_prop == "absolute"){
				var left = parseInt(this._retrieveProperty(styleArray, 'left', '0px'));
				var top = parseInt(this._retrieveProperty(styleArray, 'top', '0px'));
				if(delta){
					position = {x: left + delta.x,
						y: top + delta.y};
				}else{
					if(args.position){
						position = args.position;
						delta = {x:args.position.x - left, y:args.position.y - top};
					}else{
						// Shouldn't be here ever
						console.warn('PasteTool.js _create - no value for args.position');
						position = {x:left, y:top};
						delta = {x:0, y:0};
					}
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
						var absoluteWidgetsZindex = this._context.getPreference('absoluteWidgetsZindex');
						command.add(new StyleCommand(w, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
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
	},

	
	// Looks for a particular property within styleArray
	 _retrieveProperty: function(styleArray, propName, defaultValue){
		var propValue = defaultValue;
		if(styleArray && styleArray.length>0){
			styleArray.forEach(function(o){	// Should be only one property per object
				if(o.hasOwnProperty(propName)){
					propValue = o[propName];
				}
			});
		}
		return propValue;
	},

	/**
	 * whether new widgets should be created using "flow" or "absolute" layout
	 * NOTE: overridden by PasteTool
	 * @return {boolean}
	 */ 
	createWithFlowLayout: function(){
		return this._position_prop != 'absolute';
	}
});
});

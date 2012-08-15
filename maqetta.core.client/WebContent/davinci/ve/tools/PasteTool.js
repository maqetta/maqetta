define(["dojo/_base/declare",
    	"./CreateTool",
    	"../widget",
    	"../metadata",
    	"../../commands/CompoundCommand",
    	"../commands/AddCommand",
    	"../commands/MoveCommand",
    	"../commands/StyleCommand",
    	"dojo/Deferred",
    	"dojo/promise/all"
    	], function(
    		declare,
			CreateTool,
			widget,
			metadata,
			CompoundCommand,
			AddCommand,
			MoveCommand,
			StyleCommand,
			Deferred,
			all
		){

return declare("davinci.ve.tools.PasteTool", CreateTool, {

	constructor: function(data) {
		this.inherited(arguments);
		this._position_prop = null;
		var d = data[0];
		if(d && d.properties){
			var styleArray = widget.parseStyleValues(d.properties.style);
			this._position_prop = widget.retrieveStyleProperty(styleArray, 'position', '');
		}
	},
	
	_create: function(args){
		var index = args.index,
			baseline,
			delta,
			position,
			command = new CompoundCommand(),
			first_c,
			newWidgets = [];

		var promise = all(this._data.map(function(d){
			// see loadType in CreateTool.  find common approach?
			var loadRequiresForTree = dojo.hitch(this, function(d){
				if (d.type) { // structure has plain 'string' nodes which don't have type or children
					if(d.children && d.children instanceof Array){ // sometimes children is just a string also
						return all(d.children.map(loadRequiresForTree, this));
					}
					return this._context.loadRequires(d.type, true, true);
				} else {
					return new Deferred().resolve(); // no-op
				}
			});
			
			return loadRequiresForTree(d).then(function(){
				var styleArray = widget.parseStyleValues(d.properties && d.properties.style);
				if(this._position_prop == "absolute"){
					var left = parseInt(widget.retrieveStyleProperty(styleArray, 'left', '0px'));
					var top = parseInt(widget.retrieveStyleProperty(styleArray, 'top', '0px'));
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
							selection = [];
	
						if (ToolCtor) {
							myTool = new ToolCtor(d);
						}

						if (myTool && myTool.addPasteCreateCommand) {
							var myArgs = {
								parent: args.parent || this._context.getContainerNode(),
				        position: position,
				        index: index
				      };

				      // returns a deferred
				      myTool.addPasteCreateCommand(command, myArgs).then(function(w) {
								if (!w) {
									return;
								}

				      	_continue(w);
				      })
						} else {
							w = widget.createWidget(d);
				      if (!w) {
								return;
							}

							command.add(new AddCommand(w, args.parent || this._context.getContainerNode(), index));
							_continue(w);
						}
	
						// gets called whenever all nessesary commands have been added to command
						function _continue(newidget) {
							if (index !== undefined && index >= 0) {
								index++;
							}
	
							newWidgets.push(newidget);
	
							if (position) {
								var absoluteWidgetsZindex = this._context.getPreference('absoluteWidgetsZindex');
								command.add(new StyleCommand(newidget, [{position: 'absolute'},{'z-index': absoluteWidgetsZindex}]));
								var moveCommand = new MoveCommand(newidget, position.x, position.y, first_c, null, null, first_c /* disable snapping*/);
								if(!first_c){
									first_c = moveCommand;
								}
								command.add(moveCommand);
							}

		/*
						selection.push(w);
	
						if(!command.isEmpty()){
							this._context.getCommandStack().execute(command);
							dojo.forEach(selection, function(w, i){
								this._context.select(w, i > 0);
							}, this);
						}
	*/
						}
					}.bind(this));
				}, this);
			}.bind(this));
		}, this)).then(function(){
			if(!command.isEmpty()){
				this._context.getCommandStack().execute(command);
				newWidgets.forEach(function(w, i){
					this._context.select(w, i > 0);
				}, this);
			}			
		}.bind(this));
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

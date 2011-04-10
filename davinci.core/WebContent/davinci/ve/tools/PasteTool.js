dojo.provide("davinci.ve.tools.PasteTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.ve.tools.PasteTool", davinci.ve.tools.CreateTool, {

	_create: function(args){
		var command = new davinci.commands.CompoundCommand();
		var index = args.index;
		var baseline = undefined;
		var selection = [];
		dojo.forEach(this._data, function(d){
			if(!this._context.loadRequires(d.type)){
				return;
			}

			var position = undefined;
			var style = davinci.ve.widget.parseStyleValues((d.properties && d.properties.style));
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
					//d.properties.style = davinci.ve.widget.getStyle(style); // not sure how thisever worked...
					// if no postion past paste where it was
					//d.properties.style = davinci.ve.widget.getStyleString(style);
				}
			}

			var widget = undefined;
			dojo.withDoc(this._context.getDocument(), function(){
				d.context=this._context;
				widget = davinci.ve.widget.createWidget(d);
			}, this);
			if(!widget){
				return;
			}

			command.add(new davinci.ve.commands.AddCommand(widget, args.parent || this._context.getContainerNode(), index));
			if(index !== undefined && index >= 0){
				index++;
			}
			if(position){
				command.add(new davinci.ve.commands.MoveCommand(widget, position.x, position.y));
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

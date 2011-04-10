dojo.provide("davinci.ve.themeEditor.SelectTool");

dojo.require("davinci.ve.metadata");
dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");

dojo.declare("davinci.ve.themeEditor._Tool", null, {

	_getTarget: function(){
		return this._target;
	},

	_setTarget: function(target){
		
		if(!this._feedback){
			this._feedback = this._context.getDocument().createElement("div");
			this._feedback.className = "editFeedback";
			this._feedback.style.position = "absolute";
			this._feedback.style.zIndex = "99"; // below Focus (zIndex = "100")
			dojo.style(this._feedback, "opacity", 0.1);
		}

		if(target == this._feedback){
			return;
		}

		var containerNode = this._context.getContainerNode();
		var widget = undefined;
		
		while(target && target != containerNode){
			widget = davinci.ve.widget.getEnclosingWidget(target);
			if(widget && !widget.getContext()){
				target = widget.domNode.parentNode;
				widget = undefined;
			}else{
				 if(widget && widget.getContainerNode()){
					// overlay feedback for "control" container (DropDownButton, etc.)
					if (!davinci.ve.metadata.queryDescriptor(widget.type, "isControl")) {
						widget = undefined;
					}
				}
				break;
			}
		}

		if(widget){
			var node = widget.getStyleNode();
			var box = this._context.getDojo().position(node, true);
			var p = this._context.getContentPosition(box);
			var e = dojo._getMarginExtents(node);
			box.l = p.x - Math.round(e.l);
			box.t = p.y - Math.round(e.t);

			if(this._feedback.parentNode != containerNode){
				containerNode.appendChild(this._feedback);
			}
			dojo.marginBox(this._feedback, box);
			this._target = widget;
		}else{
			if(this._feedback.parentNode){
				this._feedback.parentNode.removeChild(this._feedback);
			}
			this._target = undefined;
		}
	},

	_adjustPosition: function(position){
		if(!position){
			return undefined;
		}
		if(this._context.getPreference("flowLayout") || !this._context.getPreference("snapToLayoutGrid")){
			return position;
		}
		var pitch = (this._context.getPreference("layoutGridPitch") || 10);
		var x = Math.round(position.x / pitch) * pitch;
		var y = Math.round(position.y / pitch) * pitch;
		return {x: x, y: y};
	}

});

dojo.declare("davinci.ve.themeEditor.SelectTool", davinci.ve.themeEditor._Tool, {

	activate: function(context){
		
		this._context = context;
	},

	deactivate: function(){
	
		this._setTarget(null);
	},

	onMouseDown: function(event){

		var t = davinci.ve.widget.getEnclosingWidget(event.target);
		if (event.target.id.indexOf('enableWidgetFocusFrame_') >-1){
			t = event.target._widget;
		}
		var widget = (this._getTarget() || t );
		
		
		while(widget){
			if (widget.dvAttributes && widget.dvAttributes.isThemeWidget && widget.getContext() ){ // managed widget
				break;
			}
			widget = davinci.ve.widget.getEnclosingWidget(widget.domNode.parentNode);
		}
		/*
		 * prevent selection of non theme widgets.
		 * widgets with attribute dvThemeWidget="true" are selectable.
		 * 
		 */
		if(!widget)
			return;

		var selection = this._context.getSelection();
		var ctrlKey = navigator.appVersion.indexOf("Macintosh") < 0? event.ctrlKey: event.metaKey;
		if(dojo.indexOf(selection, widget) >= 0){
			if(ctrlKey && event.button !== 2){ // CTRL to toggle
				this._context.deselect(widget);
			}else if(event.button !== 2){ // Right mouse not to alter selection
				this._context.select(widget);
			}
		}else{
			// at least for V0.6 theme editor does not support ctrl
			// this._context.select(widget, ctrlKey); // CTRL to add 
			widget.subwidget = null; // the widget was just selected so ensure the subwidget is null
			this._context.select(widget, false); // at least for V0.6 theme editor does not support multi select
		}
	},

	onMouseMove: function(event){
		this._setTarget(event.target);
	},

	onMouseOut: function(event){
		// FIXME: sometime an exception occurs...
		try{
			//event.stopPropagation();
			this._setTarget(event.relatedTarget);
		}catch(e){
		}
	},

	onExtentChange: function(index, box){
		var selection = this._context.getSelection();
		var newselection = [];
		if(selection.length <= index){
			return;
		}
		var widget = selection[index];

		var command = undefined;
		if(box.w !== undefined || box.h !== undefined){
			var resizable = davinci.ve.metadata.queryDescriptor(widget.type, "resizable");
			var w = undefined;
			var h = undefined;
			switch(resizable){
			case "width":
				w = box.w;
				break;
			case "height":
				h = box.h;
			case "both":
				w = box.w;
				h = box.h;
				break;
			}
			command = new davinci.ve.commands.ResizeCommand(widget, w, h);
		}

		if(box.l !== undefined && box.t !== undefined) {
		
			var _node = widget.getStyleNode();
			if (_node.style.position != "absolute") {
				var close = davinci.ve.widget.findClosest(this._context.getContainerNode(), box, this._context);
				if (close && close.widget && (close.widget != widget)) {
					var command = new davinci.commands.CompoundCommand();
					var child = close.widget;					
					var parent = davinci.ve.widget.byNode(child.domNode.offsetParent);
					var index;
					
					if (parent.isLayoutContainer || parent.isHtmlWidget ||
							davinci.ve.metadata.queryDescriptor(parent.type, "isLayoutContainer")) {
								index = 0;
								parent = child;
					} else {
						index = parent.indexOf( child);
					}
					
					//get the data				
					dojo.forEach(selection, function(w){
						var d = w.getData( {identify:false});
						var newwidget = null;
						dojo.withDoc(this._context.getDocument(), function(){
							newwidget = davinci.ve.widget.createWidget(d);
						}, this);		
						if (!newwidget) {
							console.debug("Widget is null!!");
							return;
						}				
						command.add(new davinci.ve.commands.RemoveCommand(w));
						command.add(new davinci.ve.commands.AddCommand(newwidget,parent,index));
						index++;
						newselection.push(newwidget);
					}, this);
					
					// remove widget
					this._context.select(null);
				}				
									
			} else {
				var left = box.l;
				var top = box.t;
				var parentNode = widget.domNode.offsetParent;
				if(parentNode && parentNode != this._context.getContainerNode()){
					var p = this._context.getContentPosition(this._context.getDojo().position(parentNode, true));
					left -= (p.x - parentNode.scrollLeft);
					top -= (p.y - parentNode.scrollTop);
				}
				var position = this._adjustPosition({x: left, y: top});
				left = position.x;
				top = position.y;
				var c = new davinci.ve.commands.MoveCommand(widget, left, top);
				if(command){ // move and resize
					command = new davinci.commands.CompoundCommand(command);
					command.add(c);
				}else if(selection.length > 1){ // multiple move
					var b = widget.getMarginBox();
					var dx = left - b.l;
					var dy = top - b.t;
					command = new davinci.commands.CompoundCommand(c);
					dojo.forEach(selection, function(w){
						if(w != widget && w.getStyleNode().style.position == "absolute"){
							b =w.getMarginBox();
							c = new davinci.ve.commands.MoveCommand(w, b.l + dx, b.t + dy);
							command.add(c);
						}
					});
				}else{ // single move
					command = c;
				}
			}
		}

		if(command){
			this._context.getCommandStack().execute(command);
			dojo.forEach(newselection, function(w, i) {
				this._context.select(w, i > 0);
			}, this);			
		}else{
			this._context.select(widget); // update selection
		}
	},
	
	onKeyDown: function(event){
		switch(event.keyCode){
		case dojo.keys.TAB:
			if(this._moveFocus(event)){
				//focus should not break awary from containerNode
				dojo.stopEvent(event);
			}else{
				//nop: propagate event for next focus
				//FIXME: focus may move to the focusable widgets on containerNode
			}
			break;
		case dojo.keys.RIGHT_ARROW:
		case dojo.keys.LEFT_ARROW:
		case dojo.keys.DOWN_ARROW:
		case dojo.keys.UP_ARROW:
			this._move(event);
			break;
		default:
			break;
		}
	},
	
	_move: function(event){
		var selection = this._context.getSelection();
		if(selection.length === 0){
			return;
		}
		var dx = 0, dy = 0;
		var pitch = this._context.getPreference("keyboardMovePitch") ||	//TODO: enable this preference
					this._context.getPreference("layoutGridPitch")/2+1 ||  // +1 for rounding
					6;
		switch(event.keyCode){
		case dojo.keys.RIGHT_ARROW:	dx = pitch;	break;
		case dojo.keys.LEFT_ARROW:	dx = -pitch;break;
		case dojo.keys.DOWN_ARROW:	dy = pitch;	break;
		case dojo.keys.UP_ARROW:	dy = -pitch;break;
		default:	break;
		}
		var command = new davinci.commands.CompoundCommand();
		dojo.forEach(selection, function(w){
			var node =w.getStyleNode();
			if(node.style.position != "absolute"){
				return;
			}
			var box = dojo.marginBox(node);
			var position = this._adjustPosition({x: box.l + dx, y: box.t + dy});
			command.add(new davinci.ve.commands.MoveCommand(w, position.x, position.y));
		}, this);
		if(!command.isEmpty()){
			this._context.getCommandStack().execute(command);
		}
		
	},
	
	_moveFocus: function(event){
		var direction = event.shiftKey?-1: +1;
		var current = this._context.getSelection()[0];
		var next = null;
		var widgets = this._context.getTopWidgets();
		var nextIndex = current? dojo.indexOf(widgets, current)+direction: (direction>0? 0: widgets.length-1);
		next = widgets[nextIndex];
		while(next && !next.getContext()){ // !managed widget
			nextIndex = nextIndex + direction;
			next = widgets[nextIndex];
		}
		if(next){
			this._context.select(next);
			return true;
		}else{
			return false;
		}
	}
});

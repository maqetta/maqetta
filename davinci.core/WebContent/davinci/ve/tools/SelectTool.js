dojo.provide("davinci.ve.tools.SelectTool");

dojo.require("davinci.ve.tools._Tool");
dojo.require("davinci.ve.metadata");
dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");


dojo.declare("davinci.ve.tools.SelectTool", davinci.ve.tools._Tool, {

	activate: function(context){
		
		this._context = context;
	},

	deactivate: function(){
	
		this._setTarget(null);
		if(this._timer){ clearInterval(this._timer); }
	},

	onMouseDown: function(event){

		if((dojo.isMac && event.ctrlKey) || event.button == 2){
			// this is a context menu ("right" click)  Don't change the selection.
			return;
		}

		// If in inlineEdit mode, if we get here, the user has clicked outside of the
		// inlineEdit box, in which case we should bring down inlineEdit, commit the
		// inlineEdit changes, and leave the current selection as it was previously.
/*		var focus = (this._context && this._context._focuses && this._context._focuses[0]) ? this._context._focuses[0] : null;
		if(focus && focus._inline) {
			dojo.stopEvent(event);
			return;
		}
		*/
		var widget = (this._getTarget() || davinci.ve.widget.getEnclosingWidget(event.target));
		while(widget){
			if(widget.getContext()){ // managed widget
				break;
			}
			widget = davinci.ve.widget.getEnclosingWidget(widget.domNode.parentNode);
		}
		if(!widget){
			return;
		}

		var selection = this._context.getSelection();
		var ctrlKey = dojo.isMac ? event.metaKey: event.ctrlKey;
		if(dojo.indexOf(selection, widget) >= 0){
			if(ctrlKey){ // CTRL to toggle
				this._context.deselect(widget);
			}if(event.shiftKey){
				//TODO: multiple select
			}else{
				this._context.select(widget, null, false);
			}
		}else{
			this._context.select(widget, ctrlKey); // CTRL to add
		}
	},
	
	onDblClick: function(event){

		var widget = (this._getTarget() || davinci.ve.widget.getEnclosingWidget(event.target));
		while(widget){
			if(widget.getContext()){ // managed widget
				break;
			}
			widget = davinci.ve.widget.getEnclosingWidget(widget.domNode.parentNode);
		}
		if(!widget){
			return;
		}

		var selection = this._context.getSelection();
		var ctrlKey = dojo.isMac ? event.ctrlKey : event.metaKey;
		if(dojo.indexOf(selection, widget) >= 0){
			if(ctrlKey && event.button !== 2){ // CTRL to toggle
				this._context.deselect(widget);
			}else if(event.button !== 2){ // Right mouse not to alter selection
				this._context.select(widget, null, true);
			}
		}else{
			this._context.select(widget, ctrlKey, true); // CTRL to add
		}
	},

	onMouseMove: function(event){
		this._setTarget(event.target);
	},

	onMouseOut: function(event){
		// FIXME: sometime an exception occurs...
		try{
			this._setTarget(event.relatedTarget);
		}catch(e){
		}
	},

	_resetCursor: function(){
		if(!this._cursor){
			this._cursor = this._context.getDocument().createElement("span");
			this._cursor.className = "editCursor";
			this._cursor.style.zIndex = "99"; // below Focus (zIndex = "100")
//			dojo.style(this._feedback, "opacity", 0.1);
			this._timer = this._context.getGlobal().setInterval(
				function(node, context){
					if(context._blinkCursor){
						dojo.toggleClass(node, "editCursorBlink");
					}
				}, 400, this._cursor, this._context);
		}else if(this._cursor.parentNode){
			this._cursor.parentNode.removeChild(this._cursor);
			delete this._context._blinkCursor;
		}
	},

	onExtentChange: function(index, box, cursorOnly){
		var selection = this._context.getSelection();
		var newselection = [];
		if(selection.length <= index){
			return;
		}
		var widget = selection[index];

		var command = undefined;
		if(!cursorOnly && ("w" in box || "h" in box)){
			var resizable = davinci.ve.metadata.queryDescriptor(widget.type, "resizable"),
				w, h;
			// Adjust dimensions from border-box to content-box
			var _node = widget.getStyleNode();
			var e = dojo._getPadBorderExtents(_node);
//			box.l = Math.round(box.x + e.l);
//			box.t = Math.round(box.y + e.t);
			box.w -= e.w;
			box.h -= e.h;

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
		}else{

			var _node = widget.getStyleNode();
			if(cursorOnly && _node.style.position != "absolute"){
				// use mouse position for dropping in relative mode
				box.l = box.x;
				box.t = box.y;
			}
	
			if("l" in box && "t" in box) {
				if (_node.style.position != "absolute") {
					var close = davinci.ve.widget.findClosest(this._context.getContainerNode(), box, this._context, widget, true);
					this._resetCursor();
					if (close && close.widget && (close.widget != widget)) {
						command = cursorOnly ? undefined : new davinci.commands.CompoundCommand();
						var child = close.widget,
							parent = child.getParent(),
							index = parent.indexOf(child);

						//get the data	
						dojo.forEach(selection, function(w){
							if(cursorOnly){
								var containerNode =  parent.domNode;
								if(close.insert){
									close.widget.domNode.appendChild(this._cursor);
								}else if(index === undefined || index === -1){
									containerNode.appendChild(this._cursor);
								}else{
									var children = parent.getChildren();
									if(index < children.length && !close.hpos){
										containerNode.insertBefore(this._cursor, children[index].domNode);
									}else{
										containerNode.appendChild(this._cursor);
									}
								}
								this._context._blinkCursor = true;
								return;
							}
							var newwidget,
								d = w.getData( {identify:false});
							d.context=this._context;
							dojo.withDoc(this._context.getDocument(), function(){
								newwidget = davinci.ve.widget.createWidget(d);
							}, this);		
							if (!newwidget) {
								console.debug("Widget is null!!");
								return;
							}
							if(close.insert){
								command.add(new davinci.ve.commands.AddCommand(newwidget, close.widget, 0/*last?*/));
							}else{
								command.add(new davinci.ve.commands.AddCommand(newwidget, parent, index + (close.hpos ? 1 : 0)));
							}
							index++;
							newselection.push(newwidget);
						}, this);

						// remove widget
						if(!cursorOnly){
							dojo.forEach(selection, function(w){
								command.add(new davinci.ve.commands.RemoveCommand(w));
							}, this);

							this._context.select(null);
						}
					}				
				}else if(!cursorOnly){
					var left = box.l,
						top = box.t,
						parentNode = widget.domNode.offsetParent;
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
						var b = widget.getMarginBox(),
							dx = left - b.l,
							dy = top - b.t;
						command = new davinci.commands.CompoundCommand(c);
						dojo.forEach(selection, function(w){
							if(w != widget && w.getStyleNode().style.position == "absolute"){
								b = w.getMarginBox();
								c = new davinci.ve.commands.MoveCommand(w, b.l + dx, b.t + dy);
								command.add(c);
							}
						});
					}else{ // single move
						command = c;
					}
				}
			}
		}

		if(command){
			this._context.getCommandStack().execute(command);
			dojo.forEach(newselection, function(w, i) {
				this._context.select(w, i > 0);
			}, this);			
		}else if(!cursorOnly){
			this._context.select(widget); // update selection
		}
	},
	
	onKeyDown: function(event){
		switch(event.keyCode){
		case dojo.keys.TAB:
			if(this._moveFocus(event)){
				//focus should not break away from containerNode
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
		}
	},
	
	_move: function(event){
		var selection = this._context.getSelection();
		if(selection.length === 0){
			return;
		}
		var dx = 0, dy = 0;
		var pitch = this._context.getPreference("keyboardMovePitch") ||	//TODO: enable this preference
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
			var node = w.getStyleNode();
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
		var direction = event.shiftKey?-1: +1,
			current = this._context.getSelection()[0],
			widgets = this._context.getTopWidgets(),
			nextIndex = current? dojo.indexOf(widgets, current)+direction: (direction>0? 0: widgets.length-1),
			next = widgets[nextIndex];

		while(next && !next.getContext()){ // !managed widget
			nextIndex = nextIndex + direction;
			next = widgets[nextIndex];
		}
		if(next){
			this._context.select(next);
		}
		return next;
	}
});

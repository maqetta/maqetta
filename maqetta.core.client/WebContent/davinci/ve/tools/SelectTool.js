define(["dojo/_base/declare",        
		"davinci/ve/tools/_Tool",
		"davinci/ve/widget",
		"davinci/ve/metadata",
		"davinci/commands/CompoundCommand",
		"davinci/ve/commands/AddCommand",
		"davinci/ve/commands/RemoveCommand",
		"davinci/ve/commands/ReparentCommand",
		"davinci/ve/commands/MoveCommand",
		"davinci/ve/commands/ResizeCommand"], function(
				declare,
				tool,
				widgetUtils
		){


return declare("davinci.ve.tools.SelectTool", tool, {

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
		var widget = this._getTarget() || widgetUtils.getEnclosingWidget(event.target);
		while(widget){
			if(widget.getContext()){ // managed widget
				break;
			}
			widget = widgetUtils.getEnclosingWidget(widget.domNode.parentNode);
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

		var widget = (this._getTarget() || widgetUtils.getEnclosingWidget(event.target));
		while(widget){
			if(widget.getContext()){ // managed widget
				break;
			}
			widget = widgetUtils.getEnclosingWidget(widget.domNode.parentNode);
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
		
		function adjustLTOffsetParent(left, top){
			var parentNode = widget.domNode.offsetParent;
			if(parentNode && parentNode != context.getContainerNode()){
				var p = context.getContentPosition(context.getDojo().position(parentNode, true));
				left -= (p.x - parentNode.scrollLeft);
				top -= (p.y - parentNode.scrollTop);
			}
			return {left:left, top:top};
		}
		
		var context = this._context;
		var cp = context._chooseParent;
		var selection = context.getSelection();
		var newselection = [];
		if(selection.length <= index){
			return;
		}
		var widget = selection[index];

		var compoundCommand = undefined;
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

			var resizeCommand = new davinci.ve.commands.ResizeCommand(widget, w, h);
			if(!compoundCommand){
				compoundCommand = new davinci.commands.CompoundCommand();
			}
			compoundCommand.add(resizeCommand);
			var position_prop = dojo.style(widget.domNode, 'position');
			if("l" in box && "t" in box && position_prop == 'absolute'){
				var p = adjustLTOffsetParent(box.l, box.t);
				var left = p.left;
				var top = p.top;
				var moveCommand = new davinci.ve.commands.MoveCommand(widget, left, top);
				compoundCommand.add(moveCommand);
			}
		}else{

			var _node = widget.getStyleNode();
			//FIXME: should use computed style instead of inline style
			if(cursorOnly && _node.style.position != "absolute"){
				// use mouse position for dropping in relative mode
				box.l = box.x;
				box.t = box.y;
			}

			//FIXME: Needs cleanup. This code is really hacky.
			//We fall into next IF block only if box.l and box.t have a value
			//which code just above makes true if position!=absolute.
			//Instead, probably should just check of position!=absolute
			if("l" in box && "t" in box) {
				if (_node.style.position != "absolute") {

					var close = widgetUtils.findClosest(context.getContainerNode(), box, context, widget, true,
							dojo.hitch(this, function(w){
								return context._chooseParent.getAllowedTargetWidget(w, widget.getData()).length;
							}));
					this._resetCursor();
					if (close && close.widget && (close.widget != widget)) {
						
						if(!cursorOnly && !compoundCommand){
							compoundCommand = new davinci.commands.CompoundCommand();
						}
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
								context._blinkCursor = true;
								return;
							}
							var newwidget,
								d = w.getData( {identify:false});
							d.context=context;
							dojo.withDoc(context.getDocument(), function(){
								newwidget = widgetUtils.createWidget(d);
							}, this);		
							if (!newwidget) {
								console.debug("Widget is null!!");
								return;
							}
							if(close.insert){
								compoundCommand.add(new davinci.ve.commands.AddCommand(newwidget, close.widget, 0/*last?*/));
							}else{
								compoundCommand.add(new davinci.ve.commands.AddCommand(newwidget, parent, index + (close.hpos ? 1 : 0)));
							}
							index++;
							newselection.push(newwidget);
						}, this);

						// remove widget
						if(!cursorOnly){
							dojo.forEach(selection, function(w){
								compoundCommand.add(new davinci.ve.commands.RemoveCommand(w));
							}, this);

							context.select(null);
						}
					}				
				}else if(!cursorOnly){
					var left = box.l,
						top = box.t;
					var p = adjustLTOffsetParent(left, top);
					left = p.left;
					top = p.top;
					var position = {x: left, y: top};
					left = position.x;
					top = position.y;
					if(!compoundCommand){
						compoundCommand = new davinci.commands.CompoundCommand();
					}
					var first_c = new davinci.ve.commands.MoveCommand(widget, left, top);
					var ppw = cp.getProposedParentWidget();
					var proposedParent = ppw.parent;
					compoundCommand.add(first_c);
					var currentParent = widget.getParent();
					if(proposedParent && proposedParent != currentParent){
						compoundCommand.add(new davinci.ve.commands.ReparentCommand(widget, proposedParent, 'last'));
						var newPos = this._reparentDelta(left, top, widget.getParent(), proposedParent);
						compoundCommand.add(new davinci.ve.commands.MoveCommand(widget, newPos.l, newPos.t));
					}
					var b = widget.getMarginBox(),
						dx = left - b.l,
						dy = top - b.t;
					dojo.forEach(selection, dojo.hitch(this, function(w){
						if(w != widget){
							var mb = w.getMarginBox();
							var newLeft = mb.l + dx;
							var newTop = mb.t + dy;
							if(w.getStyleNode().style.position == "absolute"){
								// Because snapping will shift the first widget in a hard-to-predict
								// way, MoveCommand will store the actual shift amount on the
								// command object (first_c). MoveCommand will use the shift amount
								// for first_c for the other move commands.
								var c = new davinci.ve.commands.MoveCommand(w, newLeft, newTop, first_c);
								compoundCommand.add(c);
							}
							var currentParent = w.getParent();
							if(proposedParent && proposedParent != currentParent){
								compoundCommand.add(new davinci.ve.commands.ReparentCommand(w, proposedParent, 'last'));
								var newPos = this._reparentDelta(newLeft, newTop, w.getParent(), proposedParent);
								compoundCommand.add(new davinci.ve.commands.MoveCommand(w, newPos.l, newPos.t));
							}
						}
					}));
				}
			}
		}


		if(compoundCommand){
			context.getCommandStack().execute(compoundCommand);
			dojo.forEach(newselection, function(w, i) {
				context.select(w, i > 0);
			}, this);			
		}else if(!cursorOnly){
			context.select(widget); // update selection
		}
	},
	
	/**
	 * Returns {l:, t:} which holds the amount to move left: and top: properties
	 * when reparenting from oldParent to newParent such that widget stays at same
	 * physical location
	 */
	_reparentDelta: function(currLeft, currTop, oldParent, newParent){
		function getPageOFfset(node){
			var pageX = 0;
			var pageY = 0;
			while(node.tagName != 'BODY'){
				pageX += node.offsetLeft;
				pageY += node.offsetTop;
				node = node.offsetParent;
			}
			return { l:pageX, t:pageY };
		}
		var oldOffset = getPageOFfset(oldParent.domNode);
		var newOffset = getPageOFfset(newParent.domNode);
		return {
			l: currLeft + (oldOffset.l - newOffset.l),
			t: currTop + (oldOffset.t - newOffset.t)
		};
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
		var pitch = event.shiftKey ? 10 : 1;
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
			// MoveCommand treats (x,y) as positions relative to offsetParent's margin box
			// and therefore does a subtraction adjustment to take into account border width.
			var parentBorderLeft = parseInt(dojo.style(node.offsetParent, 'border-left-width'));
			var parentBorderTop = parseInt(dojo.style(node.offsetParent, 'border-top-width'));
			var box = dojo.marginBox(node);
			var position = {x: box.l + parentBorderLeft + dx, y: box.t + parentBorderTop + dy};
			command.add(new davinci.ve.commands.MoveCommand(w, position.x, position.y));
		}, this);
		if(!command.isEmpty()){
			this._context.getCommandStack().execute(command);
			this._updateTarget();	// Recalculate bounds for "target" overlay rectangle
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
});

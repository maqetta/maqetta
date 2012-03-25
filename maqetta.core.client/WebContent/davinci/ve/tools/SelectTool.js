define(["dojo/_base/declare",        
		"davinci/ve/tools/_Tool",
		"davinci/ve/widget",
		"davinci/ve/metadata",
		"dojo/dnd/Mover",
		"davinci/commands/CompoundCommand",
		"davinci/ve/commands/AddCommand",
		"davinci/ve/commands/RemoveCommand",
		"davinci/ve/commands/ReparentCommand",
		"davinci/ve/commands/MoveCommand",
		"davinci/ve/commands/ResizeCommand"], function(
				declare,
				tool,
				widgetUtils,
				Metadata,
				Mover
		){


return declare("davinci.ve.tools.SelectTool", tool, {

	activate: function(context){
		this._context = context;
	},

	deactivate: function(){
	
		this._setTarget(null);
	},

	onMouseDown: function(event){

console.log('SelectTool. onMouseDown entered');
		var createMover = false;
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
			}
			if(event.shiftKey){
				//TODO: multiple select
			}else{
				this._context.select(widget, null, false);
				createMover = true;
			}
		}else{
			this._context.select(widget, ctrlKey); // CTRL to add
			if(!ctrlKey){
				createMover = true;
			}
		}
		if(createMover){
console.log('createMover block');
			var position_prop;
			var userDojo = (widget.domNode && widget.domNode.ownerDocument && 
					widget.domNode && widget.domNode.ownerDocument.defaultView && 
					widget.domNode && widget.domNode.ownerDocument.defaultView.dojo);
			if(userDojo){
				position_prop = userDojo.style(widget.domNode, 'position');
				if(position_prop == 'absolute'){
					var parent = widget.getParent();
					if(!(parent && parent.isLayout())){
						this._moverWidget = widget;
						this._moverLastEventTarget = null;
						var cp = this._context._chooseParent;
						cp.setProposedParentWidget(null);
						selection = this._context.getSelection();
						this._moverStartLocations = [];
						for(var i=0; i<selection.length; i++){
							var l = parseInt(userDojo.style(selection[i].domNode, 'left'), 10);
							var t = parseInt(userDojo.style(selection[i].domNode, 'top'), 10);
							this._moverStartLocations.push({l:l, t:t});
						}
						this._mover = new Mover(widget.domNode, event, this);
console.log('Mover created');
					}
				}
			}
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
	
	_adjustLTOffsetParent: function(context, widget, left, top){
		var parentNode = widget.domNode.offsetParent;
		if(parentNode && parentNode != context.getContainerNode()){
			var p = context.getContentPosition(context.getDojo().position(parentNode, true));
			left -= (p.x - parentNode.scrollLeft);
			top -= (p.y - parentNode.scrollTop);
		}
		return {left:left, top:top};
	},

	onExtentChange: function(index, box){
				
		var context = this._context;
		var cp = context._chooseParent;
		var selection = context.getSelection();
		var newselection = [];
		if(selection.length <= index){
			return;
		}
		var widget = selection[index];

		var compoundCommand = undefined;
		if("w" in box || "h" in box){
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
				var p = this._adjustLTOffsetParent(context, widget, box.l, box.t);
				var left = p.left;
				var top = p.top;
				var moveCommand = new davinci.ve.commands.MoveCommand(widget, left, top);
				compoundCommand.add(moveCommand);
			}
			
		}else{

			var _node = widget.getStyleNode();
			var absolute = (dojo.style(_node, 'position') == 'absolute');
			if(!absolute) {
				if(!compoundCommand){
					compoundCommand = new davinci.commands.CompoundCommand();
				}
				var lastIdx = null;
				
				//get the data	
				dojo.forEach(selection, function(w){
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
					var ppw = cp.getProposedParentWidget();
					if(ppw && ppw.refChild){
						if(lastIdx !== null){
							idx = lastIdx + 1;
						}else{
							var ppwChildren = ppw.parent.getChildren();
							var idx = ppwChildren.indexOf(ppw.refChild);
							if(idx >= 0){
								if(ppw.refAfter){
									idx++;
								}
							}else{
								idx = null;
							}
						}
						lastIdx = idx;
					}
					if(ppw){
						compoundCommand.add(new davinci.ve.commands.AddCommand(newwidget, ppw.parent, idx));
						newselection.push(newwidget);
					}else{
						console.error('SelectTool: ppw is null');
					}
				}, this);

				// remove widget
				dojo.forEach(selection, function(w){
					compoundCommand.add(new davinci.ve.commands.RemoveCommand(w));
				}, this);

				context.select(null);
				
			}else{
				var left = box.l,
					top = box.t;
				var p = this._adjustLTOffsetParent(context, widget, left, top);
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
				var proposedParent = ppw ? ppw.parent : null;
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

		if(compoundCommand){
			context.getCommandStack().execute(compoundCommand);
			dojo.forEach(newselection, function(w, i) {
				context.select(w, i > 0);
			}, this);			
		}else{
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
			var parentBorderLeft = parseInt(dojo.style(node.offsetParent, 'borderLeftWidth'));
			var parentBorderTop = parseInt(dojo.style(node.offsetParent, 'borderTopWidth'));
			var box = dojo.marginBox(node);
			var position = {x: box.l + parentBorderLeft + dx, y: box.t + parentBorderTop + dy};
			command.add(new davinci.ve.commands.MoveCommand(w, position.x, position.y));
		}, this);
		if(!command.isEmpty()){
			this._context.getCommandStack().execute(command);
			this._updateTargetOverlays();	// Recalculate bounds for "target" overlay rectangle
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
	},
	
	onMove: function(mover, box, event){
console.log('onMove');
//console.dir(mover);
//console.dir(box);
		var selection = this._context.getSelection();
		var index = selection.indexOf(this._moverWidget);
		if(index < 0){
			console.error('SelectTool.js onMove error. move widget is not selected');
			return;
		}
		if(event.target != this._moverLastEventTarget){
			// If mouse has moved over a different widget, then null out the current
			// proposed parent widget, which will force recalculation of the list of possible parents
			var cp = this._context._chooseParent;
			cp.setProposedParentWidget(null);
		}
		this._moverLastEventTarget = event.target;
		this._moverBox = box;
		this._moverWidget.domNode.style.left = box.l + 'px';
		this._moverWidget.domNode.style.top = box.t + 'px';
		var dx = box.l - this._moverStartLocations[index].l;
		var dy = box.t - this._moverStartLocations[index].t;
		for(var i=0; i<selection.length; i++){
			if(i !== index){
				var w = selection[i];
				var l = this._moverStartLocations[i].l;
				var t = this._moverStartLocations[i].t;
				w.domNode.style.left = (l + dx) + 'px';
				w.domNode.style.top = (t + dy) + 'px';
			}
		}
    },

	onFirstMove: function(mover){
console.log('onFirstMove');
		return;
	},

	//Required for Moveable interface 
	onMoveStart: function(mover){
console.log('onMoveStart');
		return;
	},

    //Required for Moveable interface
	onMoveStop: function(mover){
console.log('onMoveStop');
		if(!this._moverBox || !this._moverWidget){
			return;
		}
		var moverBox = this._adjustLTOffsetParent(this._context, this._moverWidget, this._moverBox.l, this._moverBox.t);
		this._mover = null;
		this._moverBox = null;
		this._moverLastEventTarget = null;
		var selection = this._context.getSelection();
		var index = selection.indexOf(this._moverWidget);
		if(index < 0){
			return;
		}
		this.onExtentChange(index, moverBox);
	}

});
});

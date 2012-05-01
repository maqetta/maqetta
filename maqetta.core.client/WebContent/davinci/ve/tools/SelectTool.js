define(["dojo/_base/declare",        
		"davinci/Workbench",
		"davinci/workbench/Preferences",
		"davinci/ve/tools/_Tool",
		"davinci/ve/widget",
		"davinci/ve/metadata",
		"dojo/dnd/Mover",
		"davinci/XPathUtils",
		"davinci/html/HtmlFileXPathAdapter",
		"davinci/ve/Snap",
		"davinci/commands/CompoundCommand",
		"davinci/ve/commands/AddCommand",
		"davinci/ve/commands/RemoveCommand",
		"davinci/ve/commands/ReparentCommand",
		"davinci/ve/commands/MoveCommand",
		"davinci/ve/commands/ResizeCommand"], function(
				declare,
				Workbench,
				Preferences,
				tool,
				widgetUtils,
				Metadata,
				Mover,
				XPathUtils,
				HtmlFileXPathAdapter,
				Snap
		){


return declare("davinci.ve.tools.SelectTool", tool, {

	activate: function(context){
		this._context = context;
	},

	deactivate: function(){
	
		this._setTarget(null);
	},

	onMouseDown: function(event){
		var context = this._context;
		if(context.isFocusNode(event.target)){
			// Don't process mouse events on focus nodes. Focus.js already takes care of those events.
			return;
		}
		//FIXME: Don't allow both parent and child to be selected
		//FIXME: maybe listen for mouseout on doc, and if so, stop the dragging?
		
		this._shiftKey = event.shiftKey;
		this._spaceKey = false;
		this._sKey = false;
		var createMover = false;
		this._areaSelectClear();
		if((dojo.isMac && event.ctrlKey) || event.button == 2){
			// this is a context menu ("right" click)  Don't change the selection.
			return;
		}
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
		var selection = context.getSelection();
		
		// See if widget is a descendant of any widgets in selection
		var selectedAncestor = null;
		for(var i=0; i<selection.length; i++){
			var selWidget = selection[i];
			var w = widget;
			while(w && w != context.rootWidget){
				if(w == selWidget){
					selectedAncestor = selWidget;
					break;
				}
				w = w.getParent();
			}
			if(selectedAncestor){
				break;
			}
		}
		var moverWidget = null;
		var ctrlKey = dojo.isMac ? event.metaKey: event.ctrlKey;
		this._mouseDownInfo = null;
		if(dojo.indexOf(selection, widget) >= 0){
			if(ctrlKey){ // CTRL to toggle
				context.deselect(widget);
			}else{
				moverWidget = widget;
			}
		}else{
			if(ctrlKey){
				if(widget == context.rootWidget){
					// Ignore mousedown over body if Ctrl key is down
					return;
				}
				context.select(widget, ctrlKey); // CTRL to add
			}else{
				if(selectedAncestor){
					moverWidget = selectedAncestor;
					this._mouseDownInfo = { widget:widget, pageX:event.pageX, pageY:event.pageY, dateValue:(new Date()).valueOf() };
				}else{
					if(widget == context.rootWidget){
						// Simple mousedown over body => deselect all (for now)
						// FIXME: mousedown over body should initiate an area select operation
						context.deselect();
						this._areaSelectInit(event.pageX, event.pageY);
						return;
					}
					if (Metadata.getAllowedChild(widget.type)[0] === 'NONE') {
						context.select(widget, ctrlKey);
						moverWidget = widget;
					}else{
						this._mouseDownInfo = { widget:widget, pageX:event.pageX, pageY:event.pageY, dateValue:(new Date()).valueOf() };
						this._areaSelectInit(event.pageX, event.pageY);
					}
				}
			}
		}
		if(moverWidget){
			var position_prop;
			var userdoc = context.getDocument();	// inner document = user's document
			var userDojo = (userdoc.defaultView && userdoc.defaultView.dojo);
			if(userDojo){
				position_prop = userDojo.style(moverWidget.domNode, 'position');
				this._moverAbsolute = (position_prop == 'absolute');
				var parent = moverWidget.getParent();
				var helper = moverWidget.getHelper();
				if(!(helper && helper.disableDragging && helper.disableDragging(moverWidget)) &&
						(!parent || !parent.isLayout || !parent.isLayout())){
					this._moverWidget = moverWidget;
					this._moverLastEventTarget = null;
					var cp = context._chooseParent;
					cp.setProposedParentWidget(null);
					selection = context.getSelection();	// selection might have changed since start of this function
					this._moverStartLocations = [];
					for(var i=0; i<selection.length; i++){
						var l = parseInt(userDojo.style(selection[i].domNode, 'left'), 10);
						var t = parseInt(userDojo.style(selection[i].domNode, 'top'), 10);
						this._moverStartLocations.push({l:l, t:t});
					}
					var n = moverWidget.domNode;
					var w = n.offsetWidth;
					var h = n.offsetHeight;
					var l = n.offsetLeft;
					var t = n.offsetTop;
					var pn = n.offsetParent;
					while(pn && pn.tagName != 'BODY'){
						l += pn.offsetLeft; 
						t += pn.offsetTop; 
						pn = pn.offsetParent;
					}
					if(this._moverAbsolute){
						this._moverDragDiv = dojo.create('div', 
								{className:'selectToolDragDiv',
								style:'left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px'},
								context.rootNode);
						this._mover = new Mover(this._moverDragDiv, event, this);
					}else{
						// width/height adjustment factors, using inside knowledge of CSS classes
						var adjust1 = 10;
						var adjust2 = 8;
						l -= adjust1/2;
						t -= adjust1/2;
						var w1 = n.offsetWidth + adjust1;
						var h1 = n.offsetHeight + adjust1;
						var w2 = w1 - adjust2;
						var h2 = h1 - adjust2;
						this._moverDragDiv = dojo.create('div', {className:'flowDragOuter', 
								style:'left:'+l+'px;top:'+t+'px;width:'+w1+'px;height:'+h1+'px'},
								context.rootNode);
						dojo.create('div', {className:'flowDragInner', 
								'style':'width:'+w2+'px;height:'+h2+'px'},
								this._moverDragDiv);
						this._mover = new Mover(this._moverDragDiv, event, this);
					}
					this._altKey = event.altKey;
					this._updateMoveCursor();
					userdoc.defaultView.focus();	// Make sure the userdoc is the focus object for keyboard events
				}
			}
		}
	},

	onMouseUp: function(event){
		var context = this._context;
		if(context.isFocusNode(event.target)){
			// Don't process mouse events on focus nodes. Focus.js already takes care of those events.
			return;
		}
		var doAreaSelect = true;
		var clickInteral = 750;	// .75seconds: allow for leisurely click action
		var dblClickInteral = 750;	// .75seconds: big time slot for tablets
		var clickDistance = 10;	// within 10px: inexact for tablets
		var dateValue = (new Date()).valueOf();

		// Because we create a mover with mousedown, we need to include our own click
		// logic in case there was no actual move and user simple just clicked
		if(this._mouseDownInfo){
			if(Math.abs(event.pageX - this._mouseDownInfo.pageX) <= clickDistance &&
					Math.abs(event.pageY - this._mouseDownInfo.pageY) <= clickDistance &&
					(dateValue - this._mouseDownInfo.dateValue) <= clickInteral){
				this._context.select(this._mouseDownInfo.widget);
				doAreaSelect = false;
			}
			this._mouseDownInfo = null;
		}
		// Normal browser onDblClick doesn't work because we are interjecting 
		// an overlay DIV with a mouseDown operation. As a result,
		// the browser's rules about what is required to trigger an ondblclick are not satisfied.
		// Therefore, we have to do our own double-click timer logic
		if(this._lastMouseUp){
			if(Math.abs(event.pageX - this._lastMouseUp.pageX) <= clickDistance &&
					Math.abs(event.pageY - this._lastMouseUp.pageY) <= clickDistance &&
					(dateValue - this._lastMouseUp.dateValue) <= dblClickInteral){
				this.onDblClick(event);
			}
		}
		this._lastMouseUp = { pageX: event.pageX, pageY: event.pageY, dateValue:dateValue };
		
		// Process case where user dragged out a selection rectangle
		// If so, select all widgets inside of that rectangle
		if(this._areaSelect && doAreaSelect){
			this._areaSelectSelectWidgets(event.pageX, event.pageY);
		}
		this._areaSelectClear();

	},

	onDblClick: function(event){
		var context = this._context;
		if(context.isFocusNode(event.target)){
			// Don't process mouse events on focus nodes. Focus.js already takes care of those events.
			return;
		}
		// #2127 First check for the selectToolDragDiv, if found then use the selected widget that is hiding under it..
		var widget = (event.target.className === 'selectToolDragDiv' ) ? this._context.getSelection()[0] : (this._getTarget() || widgetUtils.getEnclosingWidget(event.target));
		//FIXME: I'm not sure this while() block make sense anymore. 
		//Not sure what a "managed widget" is.
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
		var context = this._context;
		if(context.isFocusNode(event.target)){
			// Don't process mouse events on focus nodes. Focus.js already takes care of those events.
			return;
		}
		this._setTarget(event.target);
		if(this._areaSelect){
			this._areaSelectUpdate(event.pageX, event.pageY);
		}
	},

	onMouseOut: function(event){
		// FIXME: sometime an exception occurs...
		try{
			this._setTarget(event.relatedTarget);
		}catch(e){
		}
	},
	
	_adjustLTOffsetParent: function(context, widget, left, top){
		//FIXME: Might be better to use offset* instead of scroll*
		var parentNode = widget.domNode.offsetParent;
		if(parentNode && parentNode != context.getContainerNode()){
			var p = context.getContentPosition(context.getDojo().position(parentNode, true));
			left -= (p.x - parentNode.scrollLeft);
			top -= (p.y - parentNode.scrollTop);
		}
		return {l:left, t:top};
	},

	onExtentChange: function(params){
		var index = params.index;
		var newBox = params.newBox;
		var copy = params.copy;
		var oldBoxes = params.oldBoxes;
		var applyToWhichStates = params.applyToWhichStates;
				
		var context = this._context;
		var cp = context._chooseParent;
		var selection = context.getSelection();
		var newselection = [];
		if(selection.length <= index){
			return;
		}
		var widget = selection[index];

		var compoundCommand = undefined;
		if("w" in newBox || "h" in newBox){
			var resizable = davinci.ve.metadata.queryDescriptor(widget.type, "resizable"),
				w, h;
			// Adjust dimensions from border-box to content-box
			var _node = widget.getStyleNode();
			var e = dojo._getPadBorderExtents(_node);
//			newBox.l = Math.round(newBox.x + e.l);
//			box.t = Math.round(newBox.y + e.t);
			newBox.w -= e.w;
			newBox.h -= e.h;

			switch(resizable){
			case "width":
				w = newBox.w;
				break;
			case "height":
				h = newBox.h;
			case "both":
				w = newBox.w;
				h = newBox.h;
				break;
			}

			var resizeCommand = new davinci.ve.commands.ResizeCommand(widget, w, h, applyToWhichStates);
			if(!compoundCommand){
				compoundCommand = new davinci.commands.CompoundCommand();
			}
			compoundCommand.add(resizeCommand);
			var position_prop = dojo.style(widget.domNode, 'position');
			if("l" in newBox && "t" in newBox && position_prop == 'absolute'){
				var p = this._adjustLTOffsetParent(context, widget, newBox.l, newBox.t);
				var left = p.l;
				var top = p.t;
/*
				var left = newBox.l;
				var top = newBox.t;
*/
				var moveCommand = new davinci.ve.commands.MoveCommand(widget, left, top, null, null, applyToWhichStates);
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
				var IDs = [];
				var NewWidgets = [];
				
				//get the data	
				dojo.forEach(selection, function(w){
					IDs.push(w.getId());
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
					NewWidgets.push(newwidget);
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

				// remove old widget and restore ID on the new version of the given widget(s)
				if(!copy){
					dojo.forEach(selection, function(w){
						var newwidget = NewWidgets.shift();
						compoundCommand.add(new davinci.ve.commands.RemoveCommand(w));
						var id = IDs.shift();
						if(id){
							compoundCommand.add(new davinci.ve.commands.ModifyCommand(newwidget, {id:id}));
						}
					}, this);
				}

				context.select(null);
				
			}else{
				var left = newBox.l,
					top = newBox.t;
				var p = this._adjustLTOffsetParent(context, widget, left, top);
				left = p.l;
				top = p.t;
				if(!compoundCommand){
					compoundCommand = new davinci.commands.CompoundCommand();
				}
				var first_c = new davinci.ve.commands.MoveCommand(widget, left, top, null, oldBoxes[index], applyToWhichStates);
				var ppw = cp.getProposedParentWidget();
				var proposedParent = ppw ? ppw.parent : null;
				compoundCommand.add(first_c);
				var currentParent = widget.getParent();
				if(proposedParent && proposedParent != currentParent){
					compoundCommand.add(new davinci.ve.commands.ReparentCommand(widget, proposedParent, 'last'));

					var newPos = this._reparentDelta(left, top, widget.getParent(), proposedParent);
					compoundCommand.add(new davinci.ve.commands.MoveCommand(widget, newPos.l, newPos.t, null, null, applyToWhichStates));
				}
				var b = widget.getMarginBox(),
					dx = left - b.l,
					dy = top - b.t;
				dojo.forEach(selection, dojo.hitch(this, function(w, idx){
					if(w != widget){
						var mb = w.getMarginBox();
						var newLeft = mb.l + dx;
						var newTop = mb.t + dy;
						if(w.getStyleNode().style.position == "absolute"){
							// Because snapping will shift the first widget in a hard-to-predict
							// way, MoveCommand will store the actual shift amount on the
							// command object (first_c). MoveCommand will use the shift amount
							// for first_c for the other move commands.
							var c = new davinci.ve.commands.MoveCommand(w, newLeft, newTop, first_c, oldBoxes[idx], applyToWhichStates);
							compoundCommand.add(c);
						}
						var currentParent = w.getParent();
						if(proposedParent && proposedParent != currentParent){
							compoundCommand.add(new davinci.ve.commands.ReparentCommand(w, proposedParent, 'last'));
							var newPos = this._reparentDelta(newLeft, newTop, w.getParent(), proposedParent);
							compoundCommand.add(new davinci.ve.commands.MoveCommand(w, newPos.l, newPos.t, null, null, applyToWhichStates));
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
	
	_updateMoveCursor: function(){
		var body = this._context.getDocument().body;
		if(this._moverDragDiv){
			if(this._altKey){
				dojo.removeClass(body, 'selectToolDragMove');
				dojo.addClass(body, 'selectToolDragCopy');
			}else{
				dojo.removeClass(body, 'selectToolDragCopy');
				dojo.addClass(body, 'selectToolDragMove');
			}
		}else{
			dojo.removeClass(body, 'selectToolDragMove');
			dojo.removeClass(body, 'selectToolDragCopy');
		}
	},
	
	onKeyDown: function(event){
		if(event && this._moverWidget){
			dojo.stopEvent(event);
			switch(event.keyCode){
			case dojo.keys.SHIFT:
				this._shiftKey = true;
				Snap.clearSnapLines(this._context);
				break;
			case dojo.keys.ALT:
				this._altKey = true;
				this._updateMoveCursor();
				break;
			case dojo.keys.SPACE:
				this._spaceKey = true;
				break;
			case 83:	// 's' key means apply only to current state
				this._sKey = true;
				break;
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
		}
	},
	
	onKeyUp: function(event){
		if(event && this._moverWidget){
			dojo.stopEvent(event);
			switch(event.keyCode){
			case dojo.keys.SHIFT:
				this._shiftKey = false;
				break;
			case dojo.keys.ALT:
				this._altKey = false;
				this._updateMoveCursor();
				break;
			case dojo.keys.SPACE:
				this._spaceKey = false;
				break;
			case 83:	// 's' key means apply only to current state
				this._sKey = false;
				break;
			}
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
	
	//FIXME: tab is supposed to cycle through the widgets
	//Doesn't really work at this point
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
	
	/**
	 * Callback routine from dojo.dnd.Mover with every mouse move.
	 * What that means here is dragging currently selected widgets around.
	 * @param {object} mover - return object from dojo.dnd.Mover constructor
	 * @param {object} box - {l:,t:} top/left corner of where drag DIV should go
	 * @param {object} event - the mousemove event
	 */
	onMove: function(mover, box, event){
		//FIXME: For tablets, might want to add a check for minimum initial move
		//distance to prevent accidental moves due to fat fingers.
		
		// If there was any dragging, prevent a mousedown/mouseup combination
		// from triggering a select operation
		this._mouseDownInfo = null;
		
		var context = this._context;
		var cp = context._chooseParent;
		var selection = context.getSelection();
		var index = selection.indexOf(this._moverWidget);
		if(index < 0){
			console.error('SelectTool.js onMove error. move widget is not selected');
			return;
		}
		this._context.selectionHideFocus();
		if(event.target != this._moverLastEventTarget){
			// If mouse has moved over a different widget, then null out the current
			// proposed parent widget, which will force recalculation of the list of possible parents
			cp.setProposedParentWidget(null);
		}
		this._moverLastEventTarget = event.target;
		this._moverBox = box;
		this._moverDragDiv.style.left = box.l + 'px';
		this._moverDragDiv.style.top = box.t + 'px';
		if(this._moverAbsolute){
			var leftAdjust = 0;
			var topAdjust = 0;
			var pn = this._moverWidget.domNode.offsetParent;
			while(pn && pn.tagName != 'BODY'){
				leftAdjust += pn.offsetLeft;
				topAdjust += pn.offsetTop;
				pn = pn.offsetParent;
			}
			var newLeft =  (box.l - leftAdjust);
			var newTop = (box.t - topAdjust);
			var dx = newLeft - this._moverStartLocations[index].l;
			var dy = newTop - this._moverStartLocations[index].t;
			var absDx = Math.abs(dx);
			var absDy = Math.abs(dy);
			var CONSTRAIN_MIN_DIST = 3;	// constrained dragging only active if user moves object non-trivial amount
			if(this._shiftKey && (absDx >= CONSTRAIN_MIN_DIST ||  absDy >= CONSTRAIN_MIN_DIST)){
				if(absDx > absDy){
					dy = 0;
				}else{
					dx = 0;
				}
			}
			for(var i=0; i<selection.length; i++){
				//if(i !== index){
					var w = selection[i];
					var l = this._moverStartLocations[i].l;
					var t = this._moverStartLocations[i].t;
					w.domNode.style.left = (l + dx) + 'px';
					w.domNode.style.top = (t + dy) + 'px';
				//}
			}
		}
		var widgetType = this._moverWidget.type;
		var currentParent = this._moverWidget.getParent();
		
		var parentListDiv = cp.parentListDivGet();
		if(!parentListDiv){// Make sure there is a DIV into which list of parents should be displayed
			parentListDiv = cp.parentListDivCreate({
				widgetType:widgetType, 
				absolute:this._moverAbsolute, 
				doCursor:!this._moverAbsolute, 
				beforeAfter:null, 
				currentParent:currentParent });
 		}
		var parentIframe = context.getParentIframe();
		if(parentIframe){
			// Ascend iframe's ancestors to calculate page-relative x,y for iframe
			offsetLeft = 0;
			offsetTop = 0;
			offsetNode = parentIframe;
			while(offsetNode && offsetNode.tagName != 'BODY'){
				offsetLeft += offsetNode.offsetLeft;
				offsetTop += offsetNode.offsetTop;
				offsetNode = offsetNode.offsetParent;
			}
			parentListDiv.style.left = (offsetLeft + event.pageX) + 'px';
			parentListDiv.style.top = (offsetTop + event.pageY) + 'px';
		}
		
		var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', 
				Workbench.getProject());
		var doSnapLinesX = (!this._shiftKey && editorPrefs.snap && this._moverAbsolute);
		var doSnapLinesY = doSnapLinesX;
		var showParentsPref = context.getPreference('showPossibleParents');
		var spaceKeyDown = (cp.isSpaceKeyDown() || this._spaceKey);
		var showCandidateParents = (!showParentsPref && spaceKeyDown) || (showParentsPref && !spaceKeyDown);
		var data = {type:widgetType};
		var position = { x:event.pageX, y:event.pageY};
		// Ascend widget's ancestors to calculate page-relative coordinates
		var leftAdjust = 0;
		var topAdjust = 0;
		var pn = this._moverWidget.domNode.offsetParent;
		while(pn && pn.tagName != 'BODY'){
			leftAdjust += pn.offsetLeft;
			topAdjust += pn.offsetTop;
			pn = pn.offsetParent;
		}
		var snapBox = {l:this._moverWidget.domNode.offsetLeft+leftAdjust, t:this._moverWidget.domNode.offsetTop+topAdjust, w:this._moverWidget.domNode.offsetWidth, h:this._moverWidget.domNode.offsetHeight};
		// Call the dispatcher routine that updates snap lines and
		// list of possible parents at current (x,y) location
		context.dragMoveUpdate({
				widgets:[this._moverWidget],
				data:data,
				eventTarget:event.target,
				position:position,
				absolute:this._moverAbsolute,
				currentParent:currentParent,
				rect:snapBox, 
				doSnapLinesX:doSnapLinesX, 
				doSnapLinesY:doSnapLinesY, 
				doFindParentsXY:showCandidateParents,
				doCursor:!this._moverAbsolute});
	},
	
	//Part of Mover interface
	onFirstMove: function(mover){
	},

	//Part of Mover interface
	onMoveStart: function(mover){
	},

	//Part of Mover interface
	onMoveStop: function(mover){
		var context = this._context;
		var cp = this._context._chooseParent;
		
		// Find xpath to the this_moverWidget's _srcElement and save that xpath
		var xpath, oldId;
		if(this._moverWidget && this._moverWidget._srcElement) {
			xpath= XPathUtils.getXPath(this._moverWidget._srcElement, HtmlFileXPathAdapter);
			oldId = this._moverWidget.id;
		}

		var doMove = true;
		var index, moverBox;
		if(!this._moverBox || !this._moverWidget){
			doMove = false;
		}else{
			moverBox = {l:this._moverBox.l, t:this._moverBox.t};
			var selection = context.getSelection();
			index = selection.indexOf(this._moverWidget);
			if(index < 0){
				doMove = false;
			}
		}
		if(doMove){
			// If 's' key is held down, then CSS parts of MoveCommand only applies to current state
			var applyToWhichStates = this._sKey ? 'current' : undefined;
			this.onExtentChange({
				index:index, 
				newBox:moverBox, 
				oldBoxes:this._moverStartLocations, 
				copy:this._altKey,
				applyToWhichStates:applyToWhichStates});
		}
		if(this._moverDragDiv){
			var parentNode = this._moverDragDiv.parentNode;
			if(parentNode){
				parentNode.removeChild(this._moverDragDiv);
			}
			this._moverDragDiv = null;
		}
		this._mover = null;
		this._moverBox = null;
		this._moverLastEventTarget = null;
		this._updateMoveCursor();
		context.dragMoveCleanup();
		cp.parentListDivDelete();
		context.selectionShowFocus();
		
		// Attempt to restore editFeedback DIV via call to this._setTarget()
		// Usually, we will find the right node by looking for the widget with given ID
		// if that fails then try to restore via doing xpath into model
		// FIXME: What we need to make this fully bulletproof and reliable is some way 
		// to tag an original widget, have the tag preserved across widget modification,
		// and then ability to find the widget with that tag.
		var moverWidget, moverNode;
		if(oldId){
			moverNode = context.getDocument().getElementById(oldId);
			if(moverNode){
				moverWidget = widgetUtils.getEnclosingWidget(moverNode);
			}
		}
		if(!moverWidget && xpath){
			var elem = context.model.evaluate(xpath);
			if(elem){
				var id = elem.getAttribute('id');
				if(id){
					moverWidget = widgetUtils.byId(id, context.getDocument());
				}
			}
		}
		// Ensure that the widget is actually completely in the DOM.
		// This prevents exceptions in this._setTarget, which assume DOM is fully baked
		// and sometimes things are happening too fast and the revised widget is not 
		// completely ready.
		if(moverWidget && moverWidget.domNode && moverWidget.domNode.parentNode){
			this._setTarget(moverWidget.domNode);
		}else{
			this._setTarget(null);
		}

	},
	
	_areaSelectInit: function(initPageX, initPageY){
		this._areaSelect = { x:initPageX, y:initPageY, attached:false };
		this._areaSelectDiv = dojo.create('div',
				{className:'areaSelectDiv', style:'display:none'});
	},
	
	_areaSelectUpdate: function(endX, endY){
		if(!this._areaSelect || !this._areaSelectDiv){
			return;
		}
		var o = this._getBounds(this._areaSelect.x, this._areaSelect.y, endX, endY);
		var style = this._areaSelectDiv.style;
		style.display = 'block';
		style.left = o.l + 'px';
		style.top = o.t + 'px';
		style.width = o.w + 'px';
		style.height = o.h + 'px';
		if(!this._areaSelect.attached){
			this._context.rootNode.appendChild(this._areaSelectDiv);
			this._areaSelect.attached = true;
		}
	},
	
	_areaSelectClear: function(){
		this._areaSelect = null;
		if(this._areaSelectDiv){
			var parentNode = this._areaSelectDiv.parentNode;
			if(parentNode){
				 parentNode.removeChild(this._areaSelectDiv);
			}
			this._areaSelectDiv = null;
		}

	},
	
	_areaSelectSelectWidgets: function(endX, endY){
		if(!this._areaSelect){
			return;
		}
		var o = this._getBounds(this._areaSelect.x, this._areaSelect.y, endX, endY);
		var l = o.l, t=o.t, w=o.w, h=o.h;
		var context = this._context;
		context.deselect();
		var topWidgets = context.getTopWidgets();
		for(var i=0; i<topWidgets.length; i++){
			this._areaSelectRecursive(topWidgets[i], l, t, w, h);
		}
	},
	
	_areaSelectRecursive: function(widget, l, t, w, h){
		if(!widget || !widget.domNode){
			return;
		}
		var bounds = dojo.position(widget.domNode, true);
		if(bounds.x >= l && bounds.y >= t && 
				bounds.x + bounds.w <= l + w &&
				bounds.y + bounds.h <= t + h){
			this._context.select(widget, true);
		}else{
			var children = widget.getChildren();
			for(var i=0; i<children.length; i++){
				this._areaSelectRecursive(children[i], l, t, w, h);
			}
		}
		
	},
	
	_getBounds: function(startX, startY, endX, endY){
		var o = {};
		if(startX <= endX){
			o.l = startX;
			o.w = endX - startX;
		}else{
			o.l = endX;
			o.w = startX - endX;
		}
		if(startY <= endY){
			o.t = startY;
			o.h = endY - startY;
		}else{
			o.t = endY;
			o.h = startY - endY;
		}
		return o;
	}

});
});

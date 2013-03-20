define(["dojo/_base/declare",
		"dojo/dom-geometry",
		"../../Workbench",
		"../../workbench/Preferences",
		"./_Tool",
		"../widget",
		"../metadata",
		"dojo/dnd/Mover",
		"../../XPathUtils",
		"../../html/HtmlFileXPathAdapter",
		"../Snap",
		"../../commands/CompoundCommand",
		"../commands/AddCommand",
		"../commands/ReparentCommand",
		"../commands/MoveCommand",
		"../commands/ResizeCommand",
		"../commands/ModifyCommand",
		"../tools/CreateTool",
		"../States",
		"../utils/GeomUtils"
], function(
		declare,
		domGeom,
		Workbench,
		Preferences,
		tool,
		widgetUtils,
		Metadata,
		Mover,
		XPathUtils,
		HtmlFileXPathAdapter,
		Snap,
		CompoundCommand,
		AddCommand,
		ReparentCommand,
		MoveCommand,
		ResizeCommand,
		ModifyCommand,
		CreateTool,
		States,
		GeomUtils
){


return declare("davinci.ve.tools.SelectTool", tool, {

	CONSTRAIN_MIN_DIST: 3,	// shiftKey constrained dragging only active if user moves object non-trivial amount
	
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
		this._areaSelectClear();

		// See if mouse is within selection rectangle for a primitive widget
		// Sometimes that rectangle is a bit bigger than _getTarget or getEnclosingWidget
		var widget = this._checkFocusXY(event.pageX, event.pageY);
		if(widget && Metadata.getAllowedChild(widget.type)[0] !== 'NONE'){
			widget = null;
		}
		var eventTargetWidget = this._getTarget() || widgetUtils.getEnclosingWidget(event.target);
		if(!widget){
			widget = eventTargetWidget;
		}
		while(widget){
			if(widget.getContext()){ // managed widget
				break;
			}
			widget = widgetUtils.getEnclosingWidget(widget.domNode.parentNode);
		}
		if(!widget){
			return;
		}

		if((dojo.isMac && event.ctrlKey) || event.button == 2){
			// this is a context menu ("right" click).  Select the widget, but skip the rest
			// of the logic.
			context.select(widget);
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
				this._mouseDownInfo = { widget:widget, eventTargetWidget:eventTargetWidget, pageX:event.pageX, pageY:event.pageY, dateValue:Date.now() };
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
					this._mouseDownInfo = { widget:widget, eventTargetWidget:eventTargetWidget, pageX:event.pageX, pageY:event.pageY, dateValue:Date.now() };
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
						this._mouseDownInfo = { widget:widget, eventTargetWidget:eventTargetWidget, pageX:event.pageX, pageY:event.pageY, dateValue:Date.now() };
						this._areaSelectInit(event.pageX, event.pageY);
					}
				}
			}
		}
		if(moverWidget){
			var position_prop;
			var userdoc = context.getDocument();	// inner document = user's document
			var userDojo = userdoc.defaultView && userdoc.defaultView.dojo;
			if(userDojo){
				position_prop = userDojo.style(moverWidget.domNode, 'position');
				this._moverAbsolute = (position_prop == 'absolute');
				var parent = moverWidget.getParent();
				var helper = moverWidget.getHelper();
				if(!(helper && helper.disableDragging && helper.disableDragging(moverWidget)) &&
						(!parent || !parent.isLayout || !parent.isLayout())){
					this._moverWidget = moverWidget;
					this._moverWidgets = [moverWidget];
					this._moverLastEventTarget = null;
					var cp = context._chooseParent;
					cp.setProposedParentWidget(null);
					selection = context.getSelection();	// selection might have changed since start of this function
					this._moverStartLocations = [];
					this._moverStartLocationsRel = [];
					for(var i=0; i<selection.length; i++){
						if(selection[i] != moverWidget){
							this._moverWidgets.push(selection[i]);
						}
						var marginBoxPageCoords = null;
						var selectionHelper = selection[i].getHelper();
						if(selectionHelper && selectionHelper.getMarginBoxPageCoords){
							marginBoxPageCoords = selectionHelper.getMarginBoxPageCoords(selection[i]);
						} else {
							marginBoxPageCoords = GeomUtils.getMarginBoxPageCoordsCached(selection[i].domNode);
						}
						this._moverStartLocations.push(marginBoxPageCoords);
						var relativeLeft, relativeTop;
						var offsetParent = selection[i].domNode.offsetParent;
						if(offsetParent && offsetParent.tagName != 'BODY'){
							var parentBorderBoxPageCoordinates = GeomUtils.getBorderBoxPageCoordsCached(offsetParent);
							var parentBorderExtents = domGeom.getBorderExtents(offsetParent);
							relativeLeft = marginBoxPageCoords.l - (parentBorderBoxPageCoordinates.l + parentBorderExtents.l);
							relativeTop = marginBoxPageCoords.t - (parentBorderBoxPageCoordinates.t + parentBorderExtents.t);
						}else{
							relativeLeft = marginBoxPageCoords.l;
							relativeTop = marginBoxPageCoords.t;
						}
						this._moverStartLocationsRel.push({l:relativeLeft, t:relativeTop});
					}
					var n = moverWidget.domNode;
					var offsetWidth = n.offsetWidth;
					var offsetHeight = n.offsetHeight;
					var moverWidgetMarginBoxPageCoords = null;
					if(helper && helper.getMarginBoxPageCoords){
						moverWidgetMarginBoxPageCoords = helper.getMarginBoxPageCoords(moverWidget);
						offsetWidth = moverWidgetMarginBoxPageCoords.w;
						offsetHeight = moverWidgetMarginBoxPageCoords.h;
					} else {
						moverWidgetMarginBoxPageCoords = GeomUtils.getMarginBoxPageCoordsCached(n);
					}
					var l = moverWidgetMarginBoxPageCoords.l;
					var t = moverWidgetMarginBoxPageCoords.t;
					var w = moverWidgetMarginBoxPageCoords.w;
					var h = moverWidgetMarginBoxPageCoords.h;
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
						var w1 = offsetWidth + adjust1;
						var h1 = offsetHeight + adjust1;
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

					// Chrome doesn't blur active focus node when switching frames, so focus on something else focusable first to cause the blur
					document.getElementById("maqetta_project_select").focus();
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
		var doAreaSelect = (event.which === 1);		// Only do area select if LMB was down
		var clickInteral = 750;	// .75seconds: allow for leisurely click action
		var dblClickInteral = 750;	// .75seconds: big time slot for tablets
		var clickDistance = 10;	// within 10px: inexact for tablets
		var dateValue = Date.now();

		// Because we create a mover with mousedown, we need to include our own click
		// logic in case there was no actual move and user simple just clicked
		if(this._mouseDownInfo){
			if(Math.abs(event.pageX - this._mouseDownInfo.pageX) <= clickDistance &&
					Math.abs(event.pageY - this._mouseDownInfo.pageY) <= clickDistance &&
					(dateValue - this._mouseDownInfo.dateValue) <= clickInteral){
				var widgetToSelect = this._mouseDownInfo.eventTargetWidget ? this._mouseDownInfo.eventTargetWidget : this._mouseDownInfo.widget;
				this._context.select(widgetToSelect);
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
		// #2127 First check for the selectToolDragDiv, if found then use the selected widget that is hiding under it.
		var className = event.target.getAttribute('class');
		var widget = (className === 'selectToolDragDiv' ) ? this._context.getSelection()[0] : (this._getTarget() || widgetUtils.getEnclosingWidget(event.target));
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
		this._setTarget(event.target, event);
		if(this._areaSelect){
			if(event.which === 1){		// 1=LMB
				this._areaSelectUpdate(event.pageX, event.pageY);
			}else{
				// Stop area select if LMB not down
				// We get here in WebKit if dragging on widget scrollbar
				this._areaSelectClear();
			}
		}
	},

	onMouseOver: function(event){
		// FIXME: sometime an exception occurs...
		try{
			// The purpose of this monkey business is to remember the last
			// user document node which received a mouseover event so that we
			// can restore the "target" (i.e., the editFeedback rectangle)
			// upon wrapping up various mouse down/up/move event processing.
			// We ignore any overlay DIVs created by the page editor itself.
			if(!dojo.hasClass(event.target, 'editFeedback') && !dojo.hasClass(event.target, 'selectToolDragDiv')){
				this._onMouseOverEventTargetXPath = XPathUtils.getXPath(event.target);
			}
			this._setTarget(event.target, event);
		}catch(e){
		}
	},

	onMouseOut: function(event){
		// FIXME: sometime an exception occurs...
		try{
			this._setTarget(event.relatedTarget, event);
		}catch(e){
		}
	},

	onExtentChange: function(params){
		var index = params.index;
		var newBox = params.newBox;
		var copy = params.copy;
		var oldBoxes = params.oldBoxes;
		var applyToWhichStates = params.applyToWhichStates;
		var idx;
				
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
			var resizable = Metadata.queryDescriptor(widget.type, "resizable"),
				w, h;
			// Adjust dimensions from margin box to context box
			var _node = widget.domNode;
			var _win = _node.ownerDocument.defaultView;
			var _cs = _win.getComputedStyle(_node);
			var me = GeomUtils.getMarginExtents(_node, _cs);
			var be = domGeom.getBorderExtents(_node, _cs);
			var pe = domGeom.getPadExtents(_node, _cs);
			if(typeof newBox.w == 'number'){
				newBox.w -= (me.w + be.w + pe.w);
			}
			if(typeof newBox.h == 'number'){
				newBox.h -= (me.h + be.h + pe.h);
			}
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

			var resizeCommand = new ResizeCommand(widget, w, h, applyToWhichStates);
			if(!compoundCommand){
				compoundCommand = new CompoundCommand();
			}
			compoundCommand.add(resizeCommand);
			var position_prop = dojo.style(widget.domNode, 'position');
			if("l" in newBox && "t" in newBox && position_prop == 'absolute'){
				var left = newBox.l;
				var top = newBox.t;
				var moveCommand = new MoveCommand(widget, left, top, null, null, applyToWhichStates);
				compoundCommand.add(moveCommand);
			}
			
		}else{

			var _node = widget.getStyleNode();
			var absolute = (dojo.style(_node, 'position') == 'absolute');
			if(!absolute) {
				var ppw = cp.getProposedParentWidget();
				if(ppw){
					if(!compoundCommand){
						compoundCommand = new CompoundCommand();
					}
					var lastIdx = null;
					
					//get the data	
					var reorderedSelection = context.reorderPreserveSiblingOrder(selection);
					dojo.forEach(reorderedSelection, function(w){
						if(ppw.refChild){
							if(lastIdx !== null){
								idx = lastIdx + 1;
							}else{
								var ppwChildren = ppw.parent.getChildren();
								idx = ppwChildren.indexOf(ppw.refChild);
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
						if(copy){
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
							compoundCommand.add(new AddCommand(newwidget, ppw.parent, idx));
							
							// If preference says to add new widgets to the current custom state,
							// then add appropriate StyleCommands
							CreateTool.prototype.checkAddToCurrentState(compoundCommand, newwidget);

							newselection.push(newwidget);
						}else{
							compoundCommand.add(new ReparentCommand(w, ppw.parent, idx));
							newselection.push(w);
						}
					}, this);
					context.select(null);
				}else{
					console.error('SelectTool: ppw is null');
				}
				
			}else{
				var OldParents = [];
				var OldIndex = [];
				dojo.forEach(selection, function(w, idx){
					OldParents[idx] = selection[idx].getParent();
					OldIndex[idx] = OldParents[idx].indexOf(w);
				});
				var left = newBox.l,
					top = newBox.t;
				if(!compoundCommand){
					compoundCommand = new CompoundCommand();
				}
				var ppw = cp.getProposedParentWidget();
				var proposedParent = ppw ? ppw.parent : null;
				var currentParent = widget.getParent();
				var doReparent = undefined;
				var doMove = undefined;
				if(proposedParent && proposedParent != currentParent){
					doReparent = proposedParent;
				}
				var dx = left - oldBoxes[0].l;
				var dy = top - oldBoxes[0].t;
				if(copy){
					//get the data
					var reorderedSelection = context.reorderPreserveSiblingOrder(selection);
					dojo.forEach(reorderedSelection, function(w){
						var parentWidget = w.getParent();
						if (!parentWidget) {
							console.debug("onExtentChange: parentWidget is null!!");
							return;
						}
						var children = parentWidget.getChildren();
						for(var widx = 0; widx < children.length; widx++){
							if(children[widx] == w){
								break;
							}
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
						if(proposedParent){
							compoundCommand.add(new AddCommand(newwidget, proposedParent, -1 /*append*/));
						}else{
							compoundCommand.add(new AddCommand(newwidget, parentWidget, widx));
						}
						
						// If preference says to add new widgets to the current custom state,
						// then add appropriate StyleCommands
						CreateTool.prototype.checkAddToCurrentState(compoundCommand, newwidget);

						newselection.push(newwidget);
					}, this);
					newWidget = newselection[index];
				}
				var currWidget = copy ? newWidget : widget;
				var first_c = new MoveCommand(currWidget, left, top, null, oldBoxes[index], applyToWhichStates);
				compoundCommand.add(first_c);
				if(doReparent){
					compoundCommand.add(new ReparentCommand(currWidget, proposedParent, 'last'));
					// redundant move command at same location because left/top properties need updating due to new parent
					compoundCommand.add(new MoveCommand(currWidget, left, top, null, null, applyToWhichStates));
				}
				dojo.forEach(selection, dojo.hitch(this, function(w, idx){
					currWidget = copy ? newselection[idx] : w;
					if(w != widget){
						var newLeft = oldBoxes[idx].l + dx;
						var newTop = oldBoxes[idx].t + dy;
						if(w.getStyleNode().style.position == "absolute"){
							// Because snapping will shift the first widget in a hard-to-predict
							// way, MoveCommand will store the actual shift amount on the
							// command object (first_c). MoveCommand will use the shift amount
							// for first_c for the other move commands.
							var c = new MoveCommand(currWidget, newLeft, newTop, first_c, oldBoxes[idx], applyToWhichStates, true /* disable snapping */);
							compoundCommand.add(c);
						}
						var currentParent = w.getParent();
						if(proposedParent && proposedParent != currentParent){
							compoundCommand.add(new ReparentCommand(currWidget, proposedParent, 'last'));
							// redundant move command at same location because left/top properties need updating due to new parent
							compoundCommand.add(new MoveCommand(currWidget, newLeft, newTop, null, null, applyToWhichStates, true /* disable snapping */));
						}
					}
				}));
				// If copying widgets, need to restore original widgets to their original parents and locations
				if(copy){
					dojo.forEach(selection, dojo.hitch(this, function(w, idx){
						compoundCommand.add(new ReparentCommand(selection[idx], OldParents[idx], OldIndex[idx]));
						compoundCommand.add(new MoveCommand(selection[idx], oldBoxes[idx].l, oldBoxes[idx].t, null, oldBoxes[idx], applyToWhichStates, true /* disableSnapping */));
					}));
				}
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
		if(event){
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
		var command = new CompoundCommand();
		dojo.forEach(selection, function(w){
			var marginBoxPageCoords = null;
			var helper = w.getHelper();
			if(helper && helper.getMarginBoxPageCoords){
				marginBoxPageCoords = helper.getMarginBoxPageCoords(w);
			} else {
				marginBoxPageCoords = GeomUtils.getMarginBoxPageCoords(w.domNode);
			}
			var position = {x: marginBoxPageCoords.l + dx, y: marginBoxPageCoords.t + dy};
			command.add(new MoveCommand(w, position.x, position.y));
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
		this._selectionHideFocus();
		
		// If event.target isn't a subnode of current proposed parent widget, 
		// then need to recompute proposed parent widget
		var eventTargetWithinPPW = false;
		var currentPPW = cp.getProposedParentWidget();
		if(currentPPW && currentPPW.parent && currentPPW.parent.domNode){
			var currentPPWNode = currentPPW.parent.domNode;
			if(currentPPW.parent.domNode.tagName == 'BODY'){
				eventTargetWithinPPW = true;
			}else{
				var n = event.target;
				while(n && n.tagName != 'BODY'){
					if(n == currentPPWNode){
						eventTargetWithinPPW = true;
						break;	// event.target is a descendant of currentPPW's domNode
					}
					n = n.parentNode;
				}
			}
		}
		
		if(!eventTargetWithinPPW || event.target != this._moverLastEventTarget){
			// If mouse has moved over a different widget, then null out the current
			// proposed parent widget, which will force recalculation of the list of possible parents
			cp.setProposedParentWidget(null);
		}
		this._moverLastEventTarget = event.target;
		this._moverBox = box;
		this._moverDragDiv.style.left = box.l + 'px';
		this._moverDragDiv.style.top = box.t + 'px';
		if(this._moverAbsolute){
			var newLeft = box.l;
			var newTop = box.t;
			var dx = newLeft - this._moverStartLocations[index].l;
			var dy = newTop - this._moverStartLocations[index].t;
			var absDx = Math.abs(dx);
			var absDy = Math.abs(dy);
			if(this._shiftKey && (absDx >=this.CONSTRAIN_MIN_DIST ||  absDy >= this.CONSTRAIN_MIN_DIST)){
				if(absDx > absDy){
					dy = 0;
				}else{
					dx = 0;
				}
			}
			for(var i=0; i<selection.length; i++){
				var w = selection[i];
				var l = this._moverStartLocationsRel[i].l;
				var t = this._moverStartLocationsRel[i].t;
				w.domNode.style.left = (l + dx) + 'px';
				w.domNode.style.top = (t + dy) + 'px';
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
			var scrollLeft = GeomUtils.getScrollLeft(context.rootNode);
			var scrollTop = GeomUtils.getScrollTop(context.rootNode);
			parentListDiv.style.left = (offsetLeft + event.pageX - scrollLeft) + 'px';
			parentListDiv.style.top = (offsetTop + event.pageY - scrollTop) + 'px';
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
		var snapBox = null;
		var helper = this._moverWidget.getHelper();
		if(helper && helper.getMarginBoxPageCoords){
			snapBox = helper.getMarginBoxPageCoords(this._moverWidget);
		} else {
			snapBox = GeomUtils.getMarginBoxPageCoords(this._moverWidget.domNode);
		}

		// Call the dispatcher routine that updates snap lines and
		// list of possible parents at current (x,y) location
		context.dragMoveUpdate({
				widgets:this._moverWidgets,
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
		if(!this._moverBox || !this._moverWidget || !this._moverWidget.domNode){
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
			var applyToWhichStates = undefined;
			if(this._sKey){
				var currentStatesList = States.getStatesListCurrent(this._moverWidget.domNode);
				for(var i=0; i<currentStatesList.length; i++){
					if(currentStatesList[i]){
						applyToWhichStates = currentStatesList[i];
						break;
					}
				}
			}else{
				// See if any of left/top/right/bottom have been set in any of the currently active states
				// (i.e., one of the states whose results are currently showing on the screen).
				// If so, then apply the move to that state.
				applyToWhichStates = States.propertyDefinedForAnyCurrentState(this._moverWidget.domNode, ['left','top','right','bottom']) ;
			}
			var offsetParentLeftTop = this._getPageLeftTop(this._moverWidget.domNode.offsetParent);
			var newLeft =  (moverBox.l - offsetParentLeftTop.l);
			var newTop = (moverBox.t - offsetParentLeftTop.t);
			var dx = newLeft - this._moverStartLocations[index].l;
			var dy = newTop - this._moverStartLocations[index].t;
			var absDx = Math.abs(dx);
			var absDy = Math.abs(dy);
			if(this._shiftKey && (absDx >=this.CONSTRAIN_MIN_DIST ||  absDy >= this.CONSTRAIN_MIN_DIST)){
				if(absDx > absDy){
					moverBox.t = this._moverStartLocations[index].t;
				}else{
					moverBox.l = this._moverStartLocations[index].l;
				}
			}
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
		this._mover = this._moverBox = this._moverWidget = this._moverWidgets = this._moverLastEventTarget = null;
		this._updateMoveCursor();
		context.dragMoveCleanup();
		cp.parentListDivDelete();
		this._selectionShowFocus();
		
		// Attempt to restore the "target" rectangle (i.e., editFeedback)
		// over current widget to intercept mouse events that the widget
		// itself might attempt to process.
		var query = XPathUtils.toCssPath(this._onMouseOverEventTargetXPath);
		var userDoc = context.getDocument();
		var targetNode = query ? userDoc.querySelector(query) : null;
		if(targetNode){
			this._setTarget(targetNode);
		}
	},

	_getPageLeftTop: function(node){
		var leftAdjust = node.offsetLeft,
			topAdjust = node.offsetTop,
			pn = node.offsetParent;

		while(pn && pn.tagName != 'BODY'){
			leftAdjust += pn.offsetLeft;
			topAdjust += pn.offsetTop;
			pn = pn.offsetParent;
		}
		return {l:leftAdjust, t:topAdjust};
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
		var bounds = GeomUtils.getBorderBoxPageCoordsCached(widget.domNode);
		if(bounds.l >= l && bounds.t >= t && 
				bounds.l + bounds.w <= l + w &&
				bounds.t + bounds.h <= t + h){
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
	},

	/**
	 * Sees if (pageX,pageY) is within bounds of any of the selection rectangles
	 * If so, return the corresponding selected widget
	 */
	_checkFocusXY: function(pageX, pageY){
		var context = this._context,
			selection = context.getSelection();
		for(var i=0; i<selection.length; i++){
			var box = context._focuses[i].getBounds();
			if(pageX >= box.l && pageX <= box.l + box.w &&
					pageY >= box.t && pageY <= box.t + box.h){
				return selection[i];
			}
		}
		return null;
	},

	// Hide all focus objects associated with current selection
	_selectionHideFocus: function(){
		var context = this._context,
			selection = context.getSelection();
		for(var i=0; i<selection.length; i++){
			context._focuses[i].hide();
		}
	},

	// Show all focus objects associated with current selection
	_selectionShowFocus: function(){
		var context = this._context,
			selection = context.getSelection();
		for(var i=0; i<selection.length; i++){
			context._focuses[i].show(selection[i], {});
		}
	}
});
});

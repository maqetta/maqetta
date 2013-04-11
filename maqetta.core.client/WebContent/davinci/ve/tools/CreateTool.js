define(["dojo/_base/declare",
        "dojo/dom-style",
		"../tools/_Tool",
		"davinci/Workbench",
		"davinci/workbench/Preferences",
		"../metadata",
		"../widget",
		"dojo/Deferred",
		"dojo/promise/all",
		"davinci/ve/States",
		"davinci/commands/CompoundCommand",
		"../commands/AddCommand",
		"../commands/MoveCommand",
		"../commands/ResizeCommand",
		"../commands/StyleCommand"
], function(
		declare,
		domStyle,
		_Tool,
		Workbench,
		Preferences,
		Metadata,
		Widget,
		Deferred,
		all,
		States,
		CompoundCommand,
		AddCommand,
		MoveCommand,
		ResizeCommand,
		StyleCommand
) {

var defaultInvalidTargetWidgetMessage = 'The selected target is not a valid parent for the given widget.'; //TODO: i18n

return declare("davinci.ve.tools.CreateTool", _Tool, {
	

	constructor: function(data) {
		this._data = data;
		if (data && data.type) {
			// Use resizableOnCreate property if present, else use resizable
			var resizableOnCreate = Metadata.queryDescriptor(data.type, "resizableOnCreate");
			var resizable = resizableOnCreate ||
					Metadata.queryDescriptor(data.type, "resizable");
			if (resizable !== "none") {
				this._resizable = resizable;
			}
			this._dropCursor = Metadata.queryDescriptor(data.type, "dropCursor");
		}
		// This loads helpers asynchronously in a separate thread and doesn't guarantee that
		// helpers are available at any particular time. Pulling in helpers upfront provides
		// some parallelization via background processing while waiting for user to mouseup over canvas.
		// Also, helps with ChooseParent as it shows
		// possible parents, but not absolutely critical that that information is fully accurate
		// because onMouseUp guarantees that helpers are available before calling create().
		this._requireHelpers(data);
	},

	activate: function(context){
		this._context = context;
		if(context && context.rootNode){
			this._oldCursor = context.rootNode.style.cursor;
		}
		context.rootNode.style.cursor = "crosshair";
	},

	deactivate: function(){
		if(this._context && this._context.rootNode){
			this._context.rootNode.style.cursor = this._oldCursor;
		}
		this._setTarget(null);
		delete this._mdPosition;
		this._context.dragMoveCleanup();
	},

	_getContentPosition: function(position){
		if(!position){
			return undefined;
		}
		if(position.target){ // event
			position = {x: position.pageX, y: position.pageY};
		}
		return position;
	},

	onMouseDown: function(event){
		// This function gets called if user does a 2-click widget addition:
		// 1) Click on widget in widget palette to select
		// 2) Click on canvas to indicate drop location
		this._target = Widget.getEnclosingWidget(event.target);
		this._mdPosition = this._getContentPosition(event); // mouse down position
		this._dragRect = null;
	},

	onMouseMove: function(event){
		var context = this._context;
		var cp = context._chooseParent;
		
		if(event.target != this._lastEventTarget){
			cp.setProposedParentWidget(null);
		}
		this._lastEventTarget = event.target;

		if(this._mdPosition){
			// If here, then user did a 2-click widget addition (see onMouseDown())
			// and then dragged mouse while mouse is still down
			
			// Only perform drag operation if widget is resizable
			if(this._resizable){
				context.deselect();				
				var p = this._getContentPosition(event);
				var l, t, w, h;
				var pos_x = true;
				var pos_y = true;
				if(p.x >= this._mdPosition.x){
					l = this._mdPosition.x;
					w = p.x - this._mdPosition.x;
				}else{
					l = p.x;
					w = this._mdPosition.x - p.x;
					pos_x = false;
				}
				if(p.y >= this._mdPosition.y){
					t = this._mdPosition.y;
					h = p.y - this._mdPosition.y;
				}else{
					t = p.y;
					h = this._mdPosition.y - p.y;
					pos_y = false;
				}
				if(event.shiftKey){	// force square-ish shape
					if(w >= h){
						h = w;
						if(!pos_y){
							t = this._mdPosition.y - h;
						}
					}else{
						w = h;
						if(!pos_x){
							l = this._mdPosition.x - w;
						}
					}
				}
				
				// Dynamic rectangle showing size the user is dragging
				if(!this._dragSizeRect){
					var body = context.getDocument().body;
					this._dragSizeRect = dojo.create('div',
							{style:'border:1px dashed black;z-index:1000001;position:absolute;'},
							body
						);
				}
				var style = this._dragSizeRect.style;
				style.left = l + "px";
				style.top = t + "px";
				style.width = w + "px";
				style.height = h + "px";
/*20121114 JF DELETE THIS. 
	Only commenting out for now because there might be cases where
	visual editor actually needs/uses the logic below, but it just 
	doesn't make sense. We call context.deselect() above, which
	deselects all and calls context.focus(null), thereby releasing
	any outstanding focus objects. Focus only makes sense when there
	is an active selection, but at this point we have removed
	the selection.
				if(w > 4 || h > 4){
					var box = {l: l, t: t,
						w: (w > 0 ? w : 1), h: (h > 0 ? h : 1)};
					context.focus({box: box, op: {}});
				}else{
					context.focus(null);
				}
*/
			}
		}else{
			var absolute = !this.createWithFlowLayout();
			
			// For certain widgets, put an overlay DIV on top of the widget
			// to intercept mouse events (to prevent normal widget mouse processing)
			this._setTarget(event.target, event);

			// Under certain conditions, show list of possible parent widgets
			var showParentsPref = context.getPreference('showPossibleParents');
			var showCandidateParents = (!showParentsPref && this._spaceKeyDown) ||
									   (showParentsPref && !this._spaceKeyDown);
			
			// Show dynamic snap lines
			var position = {x:event.pageX, y:event.pageY};
			var box = {l:event.pageX,t:event.pageY,w:0,h:0};
			var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', 
					Workbench.getProject());
			var doSnapLinesX = editorPrefs.snap && absolute;
			var doSnapLinesY = doSnapLinesX;
			var doCursor = !absolute;
			if (typeof this._dropCursor == 'object' && this._dropCursor.show === false){
				doCursor = false;
			}
			var beforeAfter = this._dropCursor && this._dropCursor.beforeAfter;
			context.dragMoveUpdate({
				data:this._data,
				position:position,
				absolute:absolute,
				currentParent:null,
				eventTarget:event.target, 
				rect:box, 
				doSnapLinesX:doSnapLinesX, 
				doSnapLinesY:doSnapLinesY, 
				doFindParentsXY:showCandidateParents,
				doCursor:doCursor,
				beforeAfter:beforeAfter });
		}
	},

	onMouseUp: function(event){
		var context = this._context;
		var cp = context._chooseParent; 
		var absolute = !this.createWithFlowLayout();

		if(this._dragSizeRect){
			var parentNode = this._dragSizeRect.parentNode;
			parentNode.removeChild(this._dragSizeRect);
			this._dragSizeRect = null;
		}

		var activeDragDiv = context.getActiveDragDiv();
		if(activeDragDiv){
			var elems = dojo.query('.maqCandidateParents',activeDragDiv);
			if(elems.length==1){
				elems[0].innerHTML = '';
			}
		}
		this._lastEventTarget = null;
		
		// If _mdPosition has a value, then user did a 2-click widget addition (see onMouseDown())
		// If so, then use mousedown position, else get current position
		var size, target, w, h;
		var p = this._getContentPosition(event);
		if(this._mdPosition){
			var pos_x = true;
			var pos_y = true;
			this._position = dojo.mixin({}, this._mdPosition);
			if(p.x < this._mdPosition.x){
				this._position.x = p.x;
			}
			if(this._resizable == "height"){
				w = 0;
			}else if(p.x - this._mdPosition.x >= 0){
				w = p.x - this._mdPosition.x;
			}else{
				w = this._mdPosition.x - p.x;
				pos_x = false;
			}
			if(p.y < this._mdPosition.y){
				this._position.y = p.y;
			}
			if(this._resizable == "width"){
				h = 0;
			}else if(p.y - this._mdPosition.y >= 0){
				h = p.y - this._mdPosition.y;
			}else{
				h = this._mdPosition.y - p.y;
				pos_y = false;
			}
			if(event.shiftKey){	// force square-ish shape
				if(w >= h){
					h = w;
					if(!pos_y){
						t = this._mdPosition.y - h;
					}
				}else{
					w = h;
					if(!pos_x){
						l = this._mdPosition.x - w;
					}
				}
			}
		}else{
			this._position = p;
		}
		if(this._resizable && this._position){
			var w, h;
			if(w > 4 || h > 4){
				size = {w: (w > 0 ? w : undefined), h: (h > 0 ? h : undefined)};
			}
		}

		var ppw = cp.getProposedParentWidget();
		if(ppw){
			// Use last computed parent from onMouseMove handler
			target = ppw.parent;
			if(ppw.refChild){
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
		}else{
			// Otherwise, find the appropriate parent that is located under the pointer
			var widgetUnderMouse = this._getTarget() || Widget.getEnclosingWidget(event.target);
			var data = this._data;
		    var allowedParentList = cp.getAllowedTargetWidget(widgetUnderMouse, data, true, {absolute:absolute});
		    var widgetType = dojo.isArray(data) ? data[0].type : data.type;
			var helper = Widget.getWidgetHelper(widgetType);
			if(allowedParentList.length>1 && helper && helper.chooseParent){
				//FIXME: Probably should pass all params to helper
				target = helper.chooseParent(allowedParentList);
			}else if(allowedParentList.length > 0){
		    	if(allowedParentList.indexOf(widgetUnderMouse)>=0){
		    		target = widgetUnderMouse;
		    	}else{
		    		target = allowedParentList[0];
		    	}
		    }
		}

		cp.setProposedParentWidget(null);

		/**
		 * Custom error, thrown when a valid parent widget is not found.
		 */
		var InvalidTargetWidgetError = function(message) {
		    this.prototype = Error.prototype;
		    this.name = 'InvalidTargetWidgetError';
		    this.message = message ? message : defaultInvalidTargetWidgetMessage;
		};

		try {
			// create tool _data can be an object or an array of objects
			// The array could hold a mix of widget data from different libs for example if this is a paste 
			// where a dojo button and a html label were selected.
			var data = this._data instanceof Array ? this._data : [this._data];

			// If no valid target found, throw error
			if (!target) {
				// returns an array consisting of 'type' and any 'class' properties
				function getClassList(type) {
					var classList = Metadata.queryDescriptor(type, 'class');
					if (classList) {
						return classList.split(/\s+/).push(type);
					}
					return [type];
				}

				var typeList = data.map(function(elem) {
					return elem.type;  
				}).join(', '),

				// 'this._data' may represent a single widget or an array of widgets.
				// Get data for all widgets
				children = data.map(function(elem) {
					return {
						allowedParent: Metadata.getAllowedParent(elem.type),
				        classList: getClassList(elem.type)
					};
			    });
				var errorMsg = defaultInvalidTargetWidgetMessage;
				// XXX Need to update this message for multiple widgets
				if (children.length === 1 && children[0].allowedParent) {
					errorMsg += ['The widget <span style="font-family: monospace">',
					             typeList,
					             '</span> requires ',
					             children[0].allowedParent.length > 1 ?
					            		 'one of the following parent types' :
					            			 'the parent type',
					             ' <span style="font-family: monospace">',
					             children[0].allowedParent.join(', '),
					             '</span>.'].join(''); // FIXME: i18n
					var widgetType = data[0].type;
					var helper = Widget.getWidgetHelper(widgetType);
					if(helper && helper.isAllowedError){
						errorMsg = helper.isAllowedError({
							errorMsg:errorMsg, 
							type:widgetType, 
							allowedParent:children[0].allowedParent, 
							absolute:absolute});
					}
				}
				throw new InvalidTargetWidgetError(errorMsg);
			}

			for (var i = 0; i < data.length; i++){
			    var type = data[i].type;

			    // If this is the first widget added to page from a given library,
    	        // then invoke the 'onFirstAdd' callback.
    			// NOTE: These functions must be invoked before loading the widget
    			// or its required resources.  Since create() and _create() can be
    			// overridden by "subclasses", but put this call here.
    	        var library = Metadata.getLibraryForType(type),
    	            libId = library.name,
    	            args = [type, context];
    	        if (!context._widgets.hasOwnProperty(libId)) {
    	            context._widgets[libId] = 0;
    	        }
    	        if (++context._widgets[libId] == 1) {
    	            Metadata.invokeCallback(library, 'onFirstAdd', args);
    	        }
    	        // Always invoke the 'onAdd' callback.
    	        Metadata.invokeCallback(library, 'onAdd', args);
	        }
			this.create({target: target, index:idx, directTarget: this._getTarget(), size: size});
		} catch(e) {
			var content,
				title;
			if (e instanceof InvalidTargetWidgetError) {
				content = e.message;
				title = 'Invalid Target';
			} else {
				content = 'The action was interrupted by an internal error.';
				title = 'Error';
				console.error(e);
			}
			Workbench.showMessage(title, content);
		} finally {
			// By default, exitCreateToolOnMouseUp returns true, but for
			// particular widget-specfic CreateTool subclasses, it might return false
			if(this.exitCreateToolOnMouseUp()){
				context.setActiveTool(null);
			}
			this._cleanupActions();
		}
	},
	
	_cleanupActions: function(){
		var context = this._context;
		context.dragMoveCleanup();
		if(!context.inlineEditActive()){
            var userdoc = this._context.getDocument();	// inner document = user's document
            userdoc.defaultView.focus();	// Make sure the userdoc is the focus object for keyboard events
		}
	},

	onKeyDown: function(event){
		dojo.stopEvent(event);
		var context = this._context;
		if(event.keyCode==dojo.keys.ESCAPE){
			context.setActiveTool(null);
			this._cleanupActions();
			return;
		}
		// Under certain conditions, show list of possible parent widgets
		var showParentsPref = this._context.getPreference('showPossibleParents');
		if(event.keyCode==dojo.keys.SPACE){
			this._spaceKeyDown = true;
		}else{
			this._processKeyDown(event.keyCode);
		}
		var showCandidateParents = (!showParentsPref && this._spaceKeyDown) ||
				(showParentsPref && !this._spaceKeyDown);
		var data = this._data;
		var widgetType = dojo.isArray(data) ? data[0].type : data.type;
		var cp = context._chooseParent;
		var absolute = !this.createWithFlowLayout();
		var doCursor = !absolute;
		if (typeof this._dropCursor == 'object' && this._dropCursor.show === false){
			doCursor = false;
		}
		var beforeAfter = this._dropCursor && this._dropCursor.beforeAfter;
		var currentParent = null;
		cp.dragUpdateCandidateParents({widgetType:widgetType,
				showCandidateParents:showCandidateParents, 
				absolute:absolute, 
				doCursor:doCursor, 
				beforeAfter:beforeAfter, 
				currentParent:currentParent});

	},
	
	/**
	 * Update currently proposed parent widget based on latest keydown event
	 * 
	 * @param {number} keyCode  The keyCode for the key that the user pressed
	 */
	_processKeyDown: function(keyCode){
		if(keyCode>=49 && keyCode<=57){		// 1-9
			var context = this._context;
			var cp = context._chooseParent;
			var proposedParentsList = cp.getProposedParentsList();
			if(proposedParentsList && proposedParentsList.length > 1){
				// Number character: select parent that has the given number
				// Note that the presentation is 1-based (versus 0-based) and backwards
				var index = proposedParentsList.length - (keyCode - 48);
				if(index >= 0){
					cp.setProposedParentWidget(proposedParentsList[index]);
				}
			}
		}
	},

	onKeyUp: function(event){
		// Under certain conditions, show list of possible parent widgets
		if(event.keyCode==dojo.keys.SPACE){
			this._spaceKeyDown = false;
		}
		dojo.stopEvent(event);
		var showParentsPref = this._context.getPreference('showPossibleParents');
		var showCandidateParents = (!showParentsPref && this._spaceKeyDown) ||
				(showParentsPref && !this._spaceKeyDown);
		var data = this._data;
		var widgetType = dojo.isArray(data) ? data[0].type : data.type;
		var context = this._context;
		var cp = context._chooseParent;
		var absolute = !this.createWithFlowLayout();
		var doCursor = !absolute;
		if (typeof this._dropCursor == 'object' && this._dropCursor.show === false){
			doCursor = false;
		}
		var beforeAfter = this._dropCursor && this._dropCursor.beforeAfter;
		var currentParent = null;
		cp.dragUpdateCandidateParents({widgetType:widgetType,
				showCandidateParents:showCandidateParents, 
				absolute:absolute, 
				doCursor:doCursor, 
				beforeAfter:beforeAfter, 
				currentParent:currentParent});
	},

	_requireHelpers: function(data){
		var promises = [];
		if(!data || !data.type){
			if (data instanceof Array) {
				data.forEach(function(d) {
					promises.concat(this._requireHelpers(d));
				}, this);
			}
			return promises;
		}

		promises.push(Widget.requireWidgetHelper(data.type));

		if(data.children && !dojo.isString(data.children)){
			if(!dojo.every(data.children, function(c){
				return promises.concat(this._requireHelpers(c));
			}, this)){
				return promises;
			}
		}
		return promises;
	},

	create: function(args){	
		if(!args || !this._data){
			return;
		}

		var parent = args.target,
			parentNode, child;

		while (parent) {
			parentNode = parent.getContainerNode();
			if (parentNode) { // container widget
				break;
			}
			child = parent; // insert before this widget for flow layout
			parent = parent.getParent();
		}
		var index = args.index;
		var position;
		var widgetAbsoluteLayout = false;
		if (this._data.properties && this._data.properties.style &&
				(this._data.properties.style.indexOf('absolute') > 0)) {
			widgetAbsoluteLayout = true;
		}
		if (! widgetAbsoluteLayout && this.createWithFlowLayout()) {
			// do not position child under layout container... except for ContentPane
			if (child) {
				index = parent.indexOf(child);
			}
		}else if(args.position){
			// specified position must be relative to parent
			position = args.position;
		}else if(this._position){
			// convert container relative position to parent relative position
			position = this._position;
		}

		//FIXME: data can be an array
		//debugger;
//      var data = this._data;
//		if(data && data.type && data.type.indexOf("html.") == 0){
//			var metadata = Metadata.getMetadata(data.type);
//			data.properties = data.properties || {};
//			data.properties.id = widget.getUniqueId(metadata.tagName, this._context.rootNode);
//		}else if(data && data.length){
//			for(var i = 0;i<data.length;i++){
//				var d = data[i];
//				var metadata = Metadata.getMetadata(d.type);
//				d.properties = d.properties || {};
//				d.properties.id = widget.getUniqueId(metadata.tagName, this._context.rootNode);
//			}
//		}
		this._data.context=this._context;

		all(this._requireHelpers(this._data)).then(function() {
			this._create({parent: parent, index: index, position: position, size: args.size});			
		}.bind(this));
	},

	_create: function(args){
		var context = this._context,
			promises = [],
			deferred = new Deferred();

		if(!this._loadType(this._data, promises)){
			deferred.reject();
			return deferred;
		}

		all(promises).then(function(){
			var w;
			if(this.createNewWidget()){
				dojo.withDoc(this._context.getDocument(), function(){
					w = Widget.createWidget(this._data);
				}, this);
			}else{
				w = this._widget;
			}
			if(!w){
				deferred.reject(new Error("Failed to create widget"));
			}
	
			var command = new CompoundCommand();
	
			if(this.createNewWidget()){
				args.size = this._getInitialSize(w, args);
				
				command.add(new AddCommand(w,
					args.parent || this._context.getContainerNode(),
					args.index));
				if(args.position){
					var absoluteWidgetsZindex = context.getPreference('absoluteWidgetsZindex');
					command.add(new StyleCommand(w, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
					command.add(new MoveCommand(w, args.position.x, args.position.y));
				}
				if(args.size){
					// For containers, issue a resize regardless of whether an explicit size was set.
					// In the case where a widget is nested in a layout container,
					// resize()+layout() will not get called during create. 
					var width = args.size.w,
						height = args.size.h;
					command.add(new ResizeCommand(w, width, height));
					var helper = Widget.getWidgetHelper(w.type);
					if(helper && helper.onCreateResize){
						helper.onCreateResize(command, w, width, height);
					}
				}
				// If preference says to add new widgets to the current custom state,
				// then add appropriate StyleCommands
				this.checkAddToCurrentState(command, w);
			}
			var w_id = w.id;
			// Custom CreateTools might define this function
			if(this.addToCommandStack){
				this.addToCommandStack(command, {widget:w})
			}
			if(!command.isEmpty()){
				this._context.getCommandStack().execute(command);
			}
			
			if(w.isLayoutContainer){
				w.resize();
			}
			var w = Widget.byId(w_id);
			this._select(w);
			this._widget = w;
			deferred.resolve(w);
			this.mouseUpProcessingCompleted();
		}.bind(this));
		return deferred;
	},
	
	_loadType: function(data, promises){
		if(!data || !data.type){
			return false;
		}
		promises.push(this._context.loadRequires(data.type, true));
		if(data.children && !dojo.isString(data.children)){
			dojo.forEach(data.children, function(c){
				this._loadType(c, promises);
			}.bind(this));
		}
		return true;
	},
	
	/* 
	 * Generally, the desired default sizing for widgets that are typically expected to expand to fill the available 
	 * space is as follows:
	 * 		- user specfied height/width (e.g., if they drag out region for size)
	 * 		- helper calculated value
	 * 		- else if flow layout
	 * 			- else if added to html.body:
	 * 				- if only child:
	 * 					- width: 100%
	 * 					- height: auto
	 * 						- Exceptions: height 100% for large layout container widgets (like 
	 * 									BorderContainer, Tab Container, etc.)
	 * 				- else if more than one child
	 * 					- width: 100%
	 * 					- height: auto
	 * 			- else if added to container like ContentPane, div, etc.
	 * 				-if only child:
	 * 					- width: 100%
	 * 					- height 100%
	 * 				-else if more than one child:
	 * 					- width: 100%
	 * 					- height: auto
	 * 		- else if ABSOLUTE layout
	 * 				- width: 300px
	 * 				- height: 300px	
	 * 
	 * If a widget wants this behavior, it should specify the following in its metadata:
	 * 
	 * 		"initialSize": "auto"
	 * 
	 * If the widget desires the same custom size in both the "flow" and "absolute" cases, this can be specified as
	 * follows:
	 * 
	 * 		"initialSize": {
	 * 			"width": "250px",
	 * 			"height": "200px 
	 * 		}
	 * 
	 * If the widget wants to specify different sizes in the "flow" and/or "absolute" cases, this can be specifed
	 * as follows:
	 * 
	 * 		"initialSize": {
	 * 			"flow": {
	 * 				"width": "50%",
	 * 				"height": "50%"
	 * 			},
	 * 			"absolute: {
	 * 				"width": "100px",
	 * 				"height": "100px"
	 * 			}
	 * 		}
	 * 
	 * For any finer grain control, the initialSize helper function should be implemented.
	 */
	_getInitialSize: function(w, args) {
		var returnSize = args.size;
		
		// No user-specified size, so invoke widget's initialSize helper (if it exists)
		var helper = w.getHelper();
		if(helper && helper.initialSize){
			var size =  helper.initialSize(args);
			if(size){
				returnSize = size;
			}
		} 
		
		//No size returned from the helper and no dragged out side, so determine initial size based metadata
		if (!returnSize) {
			var initialSizeMetadata = Metadata.queryDescriptor(w.type, "initialSize");
			if (initialSizeMetadata) {
				// If widget is not being added at an absolute location (i.e., no value for args.position), then we
				// consider ourseleves in FLOW mode
				if(args && !args.position) {
					var parentWidget = args.parent;
					//Check to see if being added to the BODY
					if (parentWidget.type == "html.body") {
						//Check to see if we should do the default initial size
						if (initialSizeMetadata == "auto" || initialSizeMetadata.flow == "auto") {
							returnSize = {
								w: '100%',
								h: 'auto'
							};
						} else { 
							// No "auto" specified, so look for explicit sizes in metadata
							returnSize = this._getExplicitFlowSizeFromMetadata(initialSizeMetadata);
						}
					//Check to see if being added to other non-BODY containers
					} else if (this._isTypeContainer(parentWidget.type)) {
						//Check to see if we should do the default initial size
						if (initialSizeMetadata == "auto" || initialSizeMetadata.flow == "auto") {
							var parentChildren = parentWidget.getData().children;
							returnSize = {
								w: '100%',
								//Make height "auto" if more than one child, else 100% if widget is first child
								h: (parentChildren && parentChildren.length) ? 'auto' : '100%'
							};
						} else { 
							// No "auto" handling specified, so look for explicit sizes in metadata
							returnSize = this._getExplicitFlowSizeFromMetadata(initialSizeMetadata);
						}
					} else {
						// Widget is not being added to anything we are specifically checking for, so look for explicit sizes 
						// in metadata
						returnSize = this._getExplicitFlowSizeFromMetadata(initialSizeMetadata);
					}
				} else {
					// There was a position specified, so we consider ourselves in ABSOLUTE mode
					if (initialSizeMetadata == "auto" || initialSizeMetadata.absolute == "auto") {
						//Metadata is telling us to use default value for  ABSOLUTE mode (e.g., 300px by 300px)
						returnSize = {
							w:'300px',
							h:'300px'
						};
					}
					else {
						// No "auto" handling specified, so look for explicit sizes in metadata
						returnSize = this._getExplicitAbsoluteSizeFromMetadata(initialSizeMetadata);
					}
				}
			}
		}
	
		return returnSize;
	},
	
	_getExplicitFlowSizeFromMetadata: function(initialSizeMetadata) {
		var returnSize = null;
		
		//First see if explicit flow values set
		if (initialSizeMetadata.flow) {
			returnSize = {
				w: initialSizeMetadata.flow.width ? initialSizeMetadata.flow.width : "100%",
				h: initialSizeMetadata.flow.height ? initialSizeMetadata.flow.height : "auto"
			};
		} else { 
			// No width/height specified for "flow" layout, so use top-level
			// width/height values
			returnSize = {
				w: initialSizeMetadata.width ? initialSizeMetadata.width : "100%",
				h: initialSizeMetadata.height ? initialSizeMetadata.height : "auto"
			};
		}
		
		return returnSize;
	},
	
	_getExplicitAbsoluteSizeFromMetadata: function(initialSizeMetadata) {
		var returnSize = null;
		
		//First see if explicit flow values set
		if (initialSizeMetadata.absolute) {
			returnSize = {
				w: initialSizeMetadata.absolute.width ? initialSizeMetadata.absolute.width : "300px",
				h: initialSizeMetadata.absolute.height ? initialSizeMetadata.absolute.height : "300px",
			};
		} else { 
			// No width/height specified for "flow" layout, so use top-level
			// width/height values
			returnSize = {
				w: initialSizeMetadata.width ? initialSizeMetadata.width : "300px",
				h: initialSizeMetadata.height ? initialSizeMetadata.height : "300px"
			};
		}
		
		return returnSize;
	},
	
	_isTypeContainer: function(type) {
		return  type && 
			(type == 'dijit/layout/ContentPane' ||
			type == 'html.div' ||
			type == 'html.form' ||
			type == 'html.fieldset');
	},
	
	_select: function(w) {
		Metadata.getSmartInput(w.type).then(function(inlineEdit){			
			if (!this._data.fileDragCreate && inlineEdit && inlineEdit.displayOnCreate) {
				w.inLineEdit_displayOnCreate = inlineEdit.displayOnCreate;
				this._context.select(w, null, true); // display inline
			} else {
				this._context.select(w); // no inline on create
			}
		}.bind(this));
	},
	
	/**
	 * whether new widgets should be created using "flow" or "absolute" layout
	 * NOTE: overridden by PasteTool
	 * @return {boolean}
	 */ 
	createWithFlowLayout: function(){
		var forceAbsolute = Metadata.queryDescriptor(this._data.type, "forceAbsolute");
		if(forceAbsolute){
			return false;
		}else{
			return this._context.getFlowLayout();
		}
	},
	
	/**
	 * Returns true if CreateTool.js should create a new widget as part of
	 * the current create operation, false if just add onto existing widget.
	 * For default CreateTool, return true. Subclasses can override this function.
	 */
	createNewWidget: function(){
		return true;
	},
	
	// In nearly all cases, mouseUp completes the create operation.
	// But for certain widgets such as Shapes.line, we allow multi-segment
	// lines to be created via multiple [mousedown/]mouseup gestures,
	// in which case the widget-specific CreateTool subclass will override this function.
	exitCreateToolOnMouseUp: function(){
		return true;
	},
	
	// Because CreateTool.js uses deferreds (async processing) to perform certain
	// tasks within create() and _create(), any widget-specific custom createtools
	// cannot just assume that at the end of onMouseUp, the widget has been created.
	// Instead, for first time addition of a particular widget, the deferreds might
	// cause the widget creation to happen asynchronously. 
	// To deal with this, custom createtools can override the function below
	// to get an explicity callback for when all associated mouseup processing
	// really has been completed.
	// Currently used by LineCreateTool.js in the shapes library.
	mouseUpProcessingCompleted: function(){
	},
	
	// If preference says to add new widgets to the current custom state,
	// then add appropriate StyleCommands
	checkAddToCurrentState: function(command, widget){
		var context = widget._edit_context;
		// If preference says to add new widgets to the current custom state,
		// then add appropriate StyleCommands
		var statesFocus = States.getFocus(context.rootNode);
		if(statesFocus && statesFocus.stateContainerNode){
			var currentState = States.getState(statesFocus.stateContainerNode);
			var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', 
					Workbench.getProject());
			if(currentState && editorPrefs.newWidgetsCurrentState){
				var displayValue = domStyle.get(widget.domNode, 'display');
				command.add(new StyleCommand(widget, [{display:'none'}]));
				command.add(new StyleCommand(widget, [{display:displayValue}], currentState));
			}
		}
	}

});

});

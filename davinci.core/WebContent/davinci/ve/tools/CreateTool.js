dojo.provide("davinci.ve.tools.CreateTool");

dojo.require("davinci.ve.tools._Tool");
dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.ve.Snap");


dojo.declare("davinci.ve.tools.CreateTool", davinci.ve.tools._Tool, {

	constructor: function(data) {
		this._data = data;
		if (data && data.type) {
			var resizable = davinci.ve.metadata.queryDescriptor(data.type, "resizable");
			if (resizable !== "none") {
				this._resizable = resizable;
			}
		}
	},

	activate: function(context){
		this._context = context;
		if(this._context && this._context.rootNode){
			this._oldCursor = this._context.rootNode.style.cursor;
		}
		this._context.rootNode.style.cursor = "crosshair";
	},

	deactivate: function(){
		if(this._context && this._context.rootNode){
			this._context.rootNode.style.cursor = this._oldCursor;
		}
		this._setTarget(null);
		this._position = undefined;
	},

	onMouseDown: function(event){
		this._position = this._adjustPosition(this._context.getContentPosition(event));
	},

	onMouseMove: function(event){
		if(this._position){
			if(this._resizable){
				var p = this._context.getContentPosition(event);
				var w = p.x - this._position.x;
				var h = p.y - this._position.y;
				if(w > 4 || h > 4){
					var box = {l: this._position.x, t: this._position.y,
						w: (w > 0 ? w : 1), h: (h > 0 ? h : 1)};
					this._context.focus({box: box, op: {}});
				}else{
					this._context.focus(null);
				}
			}
		}else{
			this._setTarget(event.target);
			if(!this._context.getFlowLayout()){
				davinci.ve.Snap.updateSnapLines(this._context, {l:event.pageX,t:event.pageY,w:0,h:0});
			}
		}
	},
	
	onKeyDown: function(event){
		switch(event.keyCode){
		case dojo.keys.ENTER:
			// a11y: assuming (50,50) instead of current mouse position (mouse may be outside of containerNode)
			this.create({parent: this._context.getSelection()[0], position: {x:50, y:50}});
			this._context.setActiveTool(null);
		}
	},

	onMouseUp: function(event){
		if(!this._position){
			this._position = this._adjustPosition(this._context.getContentPosition(event));
		}

		var target, size;

		if(event.target.tagName == "IFRAME"){
			// We registered mouse listeners on the IFRAME since registering them on the content did not work cross-iframe
			// in Safari.  Try to calculate if there's a container widget at this x/y coordinate

			//TODO: make sure to check includeScroll
			var context = this._context,
				pos = dojo.position(event.target),
				x = event.x - pos.x,
				y = event.y - pos.y,
				list = davinci.ve.widget.allWidgets(this._context.getContainerNode());
			list = list.filter(function(w){
				return davinci.ve.metadata.getAllowedChild(w.type)[0] !== 'NONE';
			}).filter(function(w){
				var c = dojo.position(w.domNode),
					p = context.getContentPosition(c);
				return x > p.x && x < p.x + c.w && y > p.y && y < p.y + c.h;
			});
			// look for a match deep in the widget hierarchy
			var match;
			if(list.some(function(w){
				match = w;
				return list.every(function(x){
					if(x != w){
						for(; x.getParent; x = x.getParent()){
							if(x == w){ return false; }
						}
					}
					return true;
				});
			})){
				target = match;
			}
			target = target || this._context.rootWidget;
		}

		target = target || this._getTarget() || davinci.ve.widget.getEnclosingWidget(event.target);
		
		try {
			// XXX Have to do this call here, rather than in the more favorable
			//  create() or _create() since different "subclasses" of CreateTool
			//  either override create() or _create().  It is very inconsistent.
			target = this._getAllowedTargetWidget(target);

			if(this._resizable && this._position){
				var p = this._context.getContentPosition(event);
				var w = (this._resizable != "height" ? p.x - this._position.x : 0);
				var h = (this._resizable != "width" ? p.y - this._position.y : 0);
				if(w > 4 || h > 4){
					size = {w: (w > 0 ? w : undefined), h: (h > 0 ? h : undefined)};
				}
			}

			this.create({target: target, size: size});
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
            var errorDialog = new davinci.ui.Error({errorText: content});
            davinci.Workbench.showModal(errorDialog, title);
		} finally {
			// Make sure that if calls above fail due to invalid target or some
			// unknown creation error that we properly unset the active tool,
			// in order to avoid drag/drop issues.
			this._context.setActiveTool(null);
			davinci.ve.Snap.clearSnapLines(this._context);
		}
	},

	create: function(args){
	
		if(!args || !this._data){
			return;
		}

		var parent = args.target,
			parentNode, child;

		// For absolute layout, always drop widgets at the top-level of the document to avoid container clipping issues #6879
		if(!this._context.getFlowLayout()){
			parent = this._context.rootWidget;
		}
		while (parent) {
			parentNode = parent.getContainerNode();
			if (parentNode) { // container widget
				break;
			}
			child = parent; // insert before this widget for flow layout
			parent = parent.getParent();
		}
//		if(!parent){
//			parent = child = undefined;
//		}
		var index = args.index;
		var position;
		var widgetAbsoluteLayout = false;
		if (this._data.properties && this._data.properties.style && (this._data.properties.style.indexOf('absolute') > 0)){
			widgetAbsoluteLayout = true;
		}
		if (! widgetAbsoluteLayout && this._context.getFlowLayout() ||
		        (parent.isHtmlWidget && ! parent.isRoot)) {
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
			var containerNode = this._context.getContainerNode();
			if(parentNode && parentNode != containerNode){
				var style = parentNode.style.position;
				if(style && style != "absolute" && style != "relative"){
					parentNode = parentNode.offsetParent;
				}
				if(parentNode && parentNode != containerNode){
					var p = this._context.getContentPosition(dojo.coords(parentNode));
					position.x -= (p.x - parentNode.scrollLeft);
					position.y -= (p.y - parentNode.scrollTop);
				}
			}
		}

		//FIXME: data can be an array
		//debugger;
//      var data = this._data;
//		if(data && data.type && data.type.indexOf("html.") == 0){
//			var metadata = davinci.ve.metadata.getMetadata(data.type);
//			data.properties = data.properties || {};
//			data.properties.id = davinci.ve.widget.getUniqueId(metadata.tagName, this._context.rootNode);
//		}else if(data && data.length){
//			for(var i = 0;i<data.length;i++){
//				var d = data[i];
//				var metadata = davinci.ve.metadata.getMetadata(d.type);
//				d.properties = d.properties || {};
//				d.properties.id = davinci.ve.widget.getUniqueId(metadata.tagName, this._context.rootNode);
//			}
//		}
		this._data.context=this._context;
		this._create({parent: parent, index: index, position: position, size: args.size});
	},

	_create: function(args){
		if(!this._loadType(this._data)){
			return;
		}

		var widget;
		dojo.withDoc(this._context.getDocument(), function(){
			widget = davinci.ve.widget.createWidget(this._data);
		}, this);
		if(!widget){
			return;
		}

		var command = new davinci.commands.CompoundCommand();

		command.add(new davinci.ve.commands.AddCommand(widget,
			args.parent || this._context.getContainerNode(),
			args.index));

		if(args.position){
			command.add(new davinci.ve.commands.MoveCommand(widget, args.position.x, args.position.y));
		}
		if(args.size || widget.isLayoutContainer){
			// For containers, issue a resize regardless of whether an explicit size was set.
			// In the case where a widget is nested in a layout container,
			// resize()+layout() will not get called during create. 
			var w = args.size && args.size.w,
				h = args.size && args.size.h;
			command.add(new davinci.ve.commands.ResizeCommand(widget, w, h));
		}
		this._context.getCommandStack().execute(command);
		this._select(widget);
		return widget;
	},
	
	_select: function(widget) {
		var inLineEdit = davinci.ve.metadata.queryDescriptor(widget.type, "inlineEdit");
		if (!this._data.fileDragCreate && inLineEdit && inLineEdit.displayOnCreate) {
			widget.inLineEdit_displayOnCreate = inLineEdit.displayOnCreate;
			this._context.select(widget,null,true); // display inline
		} else {
			this._context.select(widget); // no inline on create
		}
	},

	_loadType: function(data){
		if(!data || !data.type){
			return false;
		}
		if( !this._context.loadRequires(data.type,true)){
			return false;
		}
		if(data.children && !dojo.isString(data.children)){
			if(!dojo.every(data.children, function(c){
				return this._loadType(c);
			}, this)){
				return false;
			}
		}
		return true;
	},

	/**
	 * Find a valid parent for the dropped widget, based on the widgets'
	 * 'allowedChild' and 'allowedParent' properties. If no valid parent is
	 * found, then throw an error.
	 * 
	 * @param target {davinci.ve._Widget}
	 * 			The widget on which the user dropped the new widget.
	 * @return a widget which is allowed to contain the dropped widget 
	 * @type davinci.ve._Widget
	 * @throws {Error} if no valid parent widget is found
	 */
	_getAllowedTargetWidget: function(target) {
		// returns an array consisting of 'type' and any 'class' properties
		function getClassList(type) {
			var classList = Metadata.queryDescriptor(type, 'class');
			if (classList) {
				classList = classList.split(/\s+/);
				classList.push(type);
				return classList;
			}
			return [type];
		}
		
		// returns 'true' if any of the elements in 'classes' are in 'arr'
		function containsClass(arr, classes) {
			return classes.some(function(elem) {
				return arr.indexOf(elem) !== -1;
			});
		}
		
		// Returns 'true' if the dropped widget is allowed as a child of the
		// given parent.
		function isAllowed(children, parent) {
			var parentType = parent instanceof davinci.ve._Widget ?
					parent.type : parent._dvWidget.type;
			var parentClassList,
				allowedChild = Metadata.getAllowedChild(parentType);
			
			// special case for HTML <body>
			if (parentType === "html.body") {
				allowedChild = ["ANY"];
			}
			parentClassList = getClassList(parentType);
			
			// Cycle through children, making sure that all of them work for
			// the given parent.
			return children.every(function(child){
				var isAllowedChild = allowedChild[0] !== "NONE" &&
									 (allowedChild[0] === "ANY" ||
									  containsClass(allowedChild, child.classList));
				var isAllowedParent = child.allowedParent[0] === "ANY" ||
									  containsClass(child.allowedParent, parentClassList);
				return isAllowedChild && isAllowedParent;
			});
		}
		
		// get data for widget we are adding to page
		var Metadata = davinci.ve.metadata,
			getEnclosingWidget = davinci.ve.widget.getEnclosingWidget,
			newTarget = target,
			data = this._data.length ? this._data : [this._data],
			children = [];

		// 'this._data' may represent a single widget or an array of widgets.
		// Get data for all widgets, for use later in isAllowed().
		data.forEach(function(elem) {
			children.push({
				allowedParent: Metadata.getAllowedParent(elem.type),
				classList: getClassList(elem.type)
			});
		});

		while (newTarget && ! isAllowed(children, newTarget)) {
			newTarget = getEnclosingWidget(newTarget);
		}
		
		// If no valid target found, throw error
		if (! newTarget) {
			var typeList = [];
			data.forEach(function(elem) {
				typeList.push(elem.type);  
			});
			
			var errorMsg;
			// XXX Need to update this message for multiple widgets
			if (children.length === 1 && children[0].allowedParent) {
				errorMsg = ['The widget <span style="font-family: monospace">',
				             typeList.join(', '),
				             '</span> requires ',
				             children[0].allowedParent.length > 1 ?
				            		 'one of the following parent types' :
				            			 'the parent type',
				             ' <span style="font-family: monospace">',
				             children[0].allowedParent.join(', '),
				             '</span>.'].join('');
			}
			throw new InvalidTargetWidgetError(errorMsg);
		}
		
		return newTarget;
	}
});

/**
 * Custom error, thrown when a valid parent widget is not found.
 */
var InvalidTargetWidgetError = function(message) {
    this.prototype = Error.prototype;
    this.name = 'InvalidTargetWidgetError';
    this.message = 'The selected target is not a valid parent for the given widget.';
    if (message) {
    	this.message += ' ' + message;
    }
};
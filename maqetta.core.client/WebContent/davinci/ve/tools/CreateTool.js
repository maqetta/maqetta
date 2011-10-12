define(["dojo/_base/declare",
    	"davinci/ve/tools/_Tool",
    	"davinci/Workbench",
    	"davinci/ve/metadata",
    	"davinci/ve/widget",
    	"davinci/ui/ErrorDialog",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/commands/MoveCommand",
    	"davinci/ve/commands/ResizeCommand",
    	"davinci/ve/Snap"], function(
    		declare,
			tool,
			workbench,
			metadata,
			widget
			){

return declare("davinci.ve.tools.CreateTool", tool, {
	
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
		delete this._mdPosition;
		this._highlightNewWidgetParent(null);
	},

	onMouseDown: function(event){
		// This function gets called if user does a 2-click widget addition:
		// 1) Click on widget in widget palette to select
		// 2) Click on canvas to indicate drop location
		this._target = davinci.ve.widget.getEnclosingWidget(event.target);
		this._mdPosition = this._context.getContentPosition(event); // mouse down position
	},

	onMouseMove: function(event){
		// Needed by onKeyDown and onKeyUp handlers
		this._lastEventTarget = event.target;
		
		if(this._mdPosition){
			// If here, then user did a 2-click widget addition (see onMouseDown())
			// and then dragged mouse while mouse is still down
			
			// Only perform drag operation if widget is resizable
			if(this._resizable){
				
				var p = this._context.getContentPosition(event);
				var w = p.x - this._mdPosition.x;
				var h = p.y - this._mdPosition.y;
				if(w > 4 || h > 4){
					var box = {l: this._mdPosition.x, t: this._mdPosition.y,
						w: (w > 0 ? w : 1), h: (h > 0 ? h : 1)};
					this._context.focus({box: box, op: {}});
				}else{
					this._context.focus(null);
				}
			}
		}else{
			// For certain widgets, put an overlay DIV on top of the widget
			// to intercept mouse events (to prevent normal widget mouse processing)
			this._setTarget(event.target);
		
			// Determine target parent(s) at current location
			var target = this._getTarget() || davinci.ve.widget.getEnclosingWidget(event.target);
			var proposedParentWidget;
		    var allowedParentList = this._getAllowedTargetWidget(target, this._data, true);
		    var helper = this._getHelper();
			if(allowedParentList.length>1 && helper && helper.chooseParent){
				proposedParentWidget = helper.chooseParent(allowedParentList);
			}else{
				proposedParentWidget = allowedParentList[0];				
			}

			// Add an extra DIV that highlights the default parent widget
			//FIXME: Not yet creating the extra DIV
			this._highlightNewWidgetParent(proposedParentWidget);
			
			// Under certain conditions, show list of possible parent widgets
			this._dragUpdateCandidateParents(event.target, event.ctrlKey);
			
			if(!this._context.getFlowLayout()){
				// If absolute layout, show dynamic snap lines
				var box = {l:event.pageX,t:event.pageY,w:0,h:0};
				davinci.ve.Snap.updateSnapLines(this._context, box);
			}
		}
	},

	onMouseUp: function(event){
		var activeDragDiv = this._context.getActiveDragDiv();
		if(activeDragDiv){
			var elems = dojo.query('.maqCandidateParents',activeDragDiv);
			if(elems.length==1){
				elems[0].innerHTML = '';
			}
		}
		this._highlightNewWidgetParent(null);
		this._lastAllowedParentList = null;
		this._lastEventTarget = null;
		
		// If _mdPosition has a value, then user did a 2-click widget addition (see onMouseDown())
		// If so, then use mousedown position, else get current position
		this._position = this._mdPosition ? this._mdPosition : this._context.getContentPosition(event);

		var size,
			target = this._getTarget() || davinci.ve.widget.getEnclosingWidget(event.target);

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

		try {
			// create tool _data can be an object or an array of objects
			// The array could hold a mix of widget data from different libs for example if this is a paste 
			// where a dojo button and a html label were selected.
			var data = this._data instanceof Array ? this._data : [this._data],

			// XXX Have to do this call here, rather than in the more favorable
			//  create() or _create() since different "subclasses" of CreateTool
			//  either override create() or _create().  It is very inconsistent.
			    allowedParentList = this._getAllowedTargetWidget(target, this._data, true),
			    helper = this._getHelper();

			// If no valid target found, throw error
			if (allowedParentList.length == 0) {
				// returns an array consisting of 'type' and any 'class' properties
				function getClassList(type) {
					var classList = davinci.ve.metadata.queryDescriptor(type, 'class');
					if (classList) {
						classList = classList.split(/\s+/);
						classList.push(type);
				        return classList;
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
						allowedParent: davinci.ve.metadata.getAllowedParent(elem.type),
				        classList: getClassList(elem.type)
					};
			    });
				var errorMsg;
				// XXX Need to update this message for multiple widgets
				if (children.length === 1 && children[0].allowedParent) {
					errorMsg = ['The widget <span style="font-family: monospace">',
					             typeList,
					             '</span> requires ',
					             children[0].allowedParent.length > 1 ?
					            		 'one of the following parent types' :
					            			 'the parent type',
					             ' <span style="font-family: monospace">',
					             children[0].allowedParent.join(', '),
					             '</span>.'].join(''); // FIXME: i18n
				}
				throw new InvalidTargetWidgetError(errorMsg);
			}

			if(allowedParentList.length>1 && helper && helper.chooseParent){
				target = helper.chooseParent(allowedParentList);
			}else{
				target = allowedParentList[0];				
			}

			if(this._resizable && this._position){
				var p = this._context.getContentPosition(event);
				var w = (this._resizable != "height" ? p.x - this._position.x : 0);
				var h = (this._resizable != "width" ? p.y - this._position.y : 0);
				if(w > 4 || h > 4){
					size = {w: (w > 0 ? w : undefined), h: (h > 0 ? h : undefined)};
				}
			}

			for (var i = 0; i < data.length; i++){
			    var type = data[i].type;

			    // If this is the first widget added to page from a given library,
    	        // then invoke the 'onFirstAdd' callback.
    			// NOTE: These functions must be invoked before loading the widget
    			// or its required resources.  Since create() and _create() can be
    			// overridden by "subclasses", but put this call here.
    	        var library = davinci.ve.metadata.getLibraryForType(type),
    	            libId = library.name,
    	            args = [type, this._context];
    	        if (! this._context._widgets.hasOwnProperty(libId)) {
    	            this._context._widgets[libId] = 0;
    	        }
    	        if (++this._context._widgets[libId] == 1) {
    	            davinci.ve.metadata.invokeCallback(type, 'onFirstAdd', args);
    	        }
    	        // Always invoke the 'onAdd' callback.
    	        davinci.ve.metadata.invokeCallback(type, 'onAdd', args);
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
            var errorDialog = new davinci.ui.ErrorDialog({errorText: content});
            workbench.showModal(errorDialog, title);
		} finally {
			// Make sure that if calls above fail due to invalid target or some
			// unknown creation error that we properly unset the active tool,
			// in order to avoid drag/drop issues.
			this._context.setActiveTool(null);
			davinci.ve.Snap.clearSnapLines(this._context);
		}
	},

	onKeyDown: function(event){
		// Under certain conditions, show list of possible parent widgets
		this._dragUpdateCandidateParents(this._lastEventTarget,event.keyCode==17);	// 17=ctrl key
	},

	onKeyUp: function(event){
		// Under certain conditions, show list of possible parent widgets
		this._dragUpdateCandidateParents(this._lastEventTarget,false);
	},

	_getHelper: function(){
	    var helper = davinci.ve.metadata.queryDescriptor(this._type, "helper");
	    if (helper) {
			//FIXME: Duplicated from widget.js. Should be factored out into a utility
	    	var helperConstructor;
	        try {
	        	helperConstructor = dojo["require"](helper) && dojo.getObject(helper) /* remove && dojo.getObject after transition to AMD */;
	        } catch(e) {
	            console.error("Failed to load helper: " + helper);
	            console.error(e);
	            throw e;
	        }
	        return new helperConstructor();
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
//			data.properties.id = widget.getUniqueId(metadata.tagName, this._context.rootNode);
//		}else if(data && data.length){
//			for(var i = 0;i<data.length;i++){
//				var d = data[i];
//				var metadata = davinci.ve.metadata.getMetadata(d.type);
//				d.properties = d.properties || {};
//				d.properties.id = widget.getUniqueId(metadata.tagName, this._context.rootNode);
//			}
//		}
		this._data.context=this._context;
		this._create({parent: parent, index: index, position: position, size: args.size});
	},

	_create: function(args){
		if(!this._loadType(this._data)){
			return;
		}

		var w;
		dojo.withDoc(this._context.getDocument(), function(){
			w = widget.createWidget(this._data);
		}, this);
		if(!w){
			return;
		}

		var command = new davinci.commands.CompoundCommand();

		command.add(new davinci.ve.commands.AddCommand(w,
			args.parent || this._context.getContainerNode(),
			args.index));

		if(args.position){
			command.add(new davinci.ve.commands.MoveCommand(w, args.position.x, args.position.y));
		}
		if(args.size || w.isLayoutContainer){
			// For containers, issue a resize regardless of whether an explicit size was set.
			// In the case where a widget is nested in a layout container,
			// resize()+layout() will not get called during create. 
			var width = args.size && args.size.w,
				height = args.size && args.size.h;
			command.add(new davinci.ve.commands.ResizeCommand(w, width, height));
		}
		this._context.getCommandStack().execute(command);
		this._select(w);
		return w;
	},
	
	_select: function(w) {
		var inLineEdit = davinci.ve.metadata.queryDescriptor(w.type, "inlineEdit");
		if (!this._data.fileDragCreate && inLineEdit && inLineEdit.displayOnCreate) {
			w.inLineEdit_displayOnCreate = inLineEdit.displayOnCreate;
			this._context.select(w, null, true); // display inline
		} else {
			this._context.select(w); // no inline on create
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
	
	_dragUpdateCandidateParents: function(targetNode, showCandidateParents){

		var activeDragDiv = this._context.getActiveDragDiv();
		var parentListDiv;
		if(activeDragDiv){
			var elems = dojo.query('.maqCandidateParents',activeDragDiv);
			if(elems.length==1){
				parentListDiv = elems[0];
			}
		}
		if(parentListDiv){
			if(showCandidateParents){

				// Determine target parent(s) at current location
				var target = this._getTarget() || davinci.ve.widget.getEnclosingWidget(targetNode);
				var proposedParentWidget;
			    var allowedParentList = this._getAllowedTargetWidget(target, this._data, true);
			    var helper = this._getHelper();
				if(allowedParentList.length>1 && helper && helper.chooseParent){
					proposedParentWidget = helper.chooseParent(allowedParentList);
				}else{
					proposedParentWidget = allowedParentList[0];				
				}
				
				// Don't recreate DIV with every mousemove if parent list is the same
				var same = true;
				if(typeof this._lastAllowedParentList == 'undefined' || this._lastAllowedParentList===null){
					same = false;
				}else if(this._lastAllowedParentList.length != allowedParentList.length){
					same = false;
				}else{
					for(var i=0; i<allowedParentList.length; i++){
						if(this._lastAllowedParentList[i] != allowedParentList[i]){
							same = false;
							break;
						}
					}
				}

				if(!same){
					this._lastAllowedParentList = allowedParentList;
					var parentListDiv = elems[0];
					var len = allowedParentList.length;
					parentListDiv.innerHTML = '';
					var headerDiv = dojo.create('div',{className:'maqCandidateParentsHeader'},parentListDiv);
					var listDiv = dojo.create('div',{className:'maqCandidateParentsList'},parentListDiv);
					var helpDiv = dojo.create('div',{className:'maqCandidateParentsHelp'},parentListDiv);
					if(len == 0){
						// FIXME: need to globalize
						headerDiv.innerHTML = 'No valid parents at this position';
					}else if(len == 1){
						headerDiv.innerHTML = 'Will become a child of:';
						dojo.create('div',{className:'maqCandidateListItem',innerHTML:davinci.ve.widget.getLabel(allowedParentList[0])},listDiv);
					}else{
						headerDiv.innerHTML = 'Candidate parents:';
						for(var i=0; i<allowedParentList.length; i++){
							dojo.create('div',{className:'maqCandidateListItem',innerHTML:davinci.ve.widget.getLabel(allowedParentList[i])},listDiv);
						}
						helpDiv.innerHTML = 'Maybe some day you can choose';
					}
				}
			}else{
				parentListDiv.innerHTML = '';
				this._lastAllowedParentList = null;
			}
		}
	
	},
	
	/**
	 * During widget drag/drop creation, highlight the widget that would
	 * be the parent of the new widget
	 * @param {davinci.ve._Widget} newWidgetParent  Parent widget to highlight
	 */
	_highlightNewWidgetParent: function(newWidgetParent){
		if(newWidgetParent != this._newWidgetParent){
			if(this._newWidgetParent){
				this._newWidgetParent.domNode.style.outline = '';
			}
			this._newWidgetParent = newWidgetParent;
			if(newWidgetParent){
				newWidgetParent.domNode.style.outline = '1px solid brown';
			}
		}
	}
});

});

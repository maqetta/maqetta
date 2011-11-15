dojo.provide("davinci.ve.Focus");

dojo.require("dijit._Widget");
dojo.require("dojo.dnd.Mover");

dojo.require("dijit.InlineEditBox"); // should be inferred by other dependencies?
dojo.require("dijit.Menu");
dojo.require("davinci.ve.metadata");
//dojo.require("davinci.ve.commands.ModifyCommand");

(function(){
    
var LEFT = 0,
    RIGHT = 1,
    TOP = 2,
    BOTTOM = 3,
    LEFT_TOP = 4,
    LEFT_BOTTOM = 5,
    RIGHT_TOP = 6,
    RIGHT_BOTTOM = 7,
	DRAG_NOB = 8;	// Overlay nob that follows mouse during drag operation

dojo.declare("davinci.ve.Focus", dijit._Widget, {

    size: 6,

    postCreate: function(){
        if(this.size < 2){
            this.size = 2;
        }

        dojo.style(this.domNode, {position: "absolute", zIndex: 1000, display: "none"}); // FIXME: move to CSS

        this._frames = [];
        for(var i = 0; i < 4; i++){
            var style = {position: "absolute", opacity: 0.5, overflow: "hidden", cursor: "move"}; // move to CSS
            dojo.mixin(style, i < 2 ? {width: this.size + "px", height: this.size * 2 + "px"} : {height: this.size + "px"});
            var frame = dojo.create("div", {"class": "editFocusFrame", style: style}, this.domNode);
            this._frames.push(frame);
            this.connect(frame, "onmousedown", "onMouseDown");
            this.connect(frame, "onmouseup", "onMouseUp");
            this.connect(frame, "ondblclick", "onDblClick");
        }
        this._frames[LEFT].style.left =
            this._frames[LEFT].style.top =
            this._frames[RIGHT].style.top =
            this._frames[TOP].style.top = -this.size + "px";

        this._nobs = [];
        var cursors = ["w-resize", "e-resize", "n-resize", "s-resize",
            "nw-resize", "sw-resize", "ne-resize", "se-resize"];
        var border = (dojo.isIE ? 0 : 2);
        for(var i = 0; i < 9; i++){
            var nob = dojo.create("div", {"class": "editFocusNob", style: {
                position: "absolute",
                width: this.size - border + "px",
                height: this.size - border + "px",
                overflow: "hidden",
                cursor: cursors[i]
            }}, this.domNode);
            this._nobs.push(nob);
            this.connect(nob, "onmousedown", "onMouseDown");
            this.connect(nob, "onmouseup", "onMouseUp");
        }
        this._nobs[DRAG_NOB].style.display = 'none';	// Becomes visible upon mousedown when dragging frame
        this._nobs[DRAG_NOB].style.background = 'transparent';
        this._nobs[DRAG_NOB].style.border = 'none';
        
        this._nobs[LEFT].style.left =
            this._nobs[TOP].style.top =
            this._nobs[LEFT_TOP].style.left =
            this._nobs[LEFT_TOP].style.top =
            this._nobs[LEFT_BOTTOM].style.left =
            this._nobs[RIGHT_TOP].style.top = -this.size + "px";
        this._nobIndex = -1;

        // _box holds resize values during dragging assuming no shift-key constraints
        // _constrained holds resize values after taking into account shift-key constraints
        this._box = {l: 0, t: 0, w: 0, h: 0};
        this._constrained = dojo.mixin({}, this._box);
        
        this._resizable = {width: true, height: true};
    },
    
    move: function(box, event){
        if(!box){
            return;
        }
        var context = this._context;
        var cp = context._chooseParent;
		if(event){
			if(event.target != this._lastEventTarget){
				// If mouse has moved over a different widget, then null out the current
				// proposed parent widget, which will force recalculation of the list of possible parents
				cp.setProposedParentWidget(null);
			}
			this._lastEventTarget = event.target;
		}else{
			// Sometimes this routine gets called without an event object
			this._lastEventTarget = null;
		}

        var b = this._box;
        b.l = box.l;
        b.t = box.t;

        var position_prop;
        if(this._selectedWidget){
            var position_prop = dojo.style(this._selectedWidget.domNode,"position");
        }
        var absolute = (position_prop=="absolute");

        // Constrained movement in x or y if shift key is down
        var domNode = this._selectedWidget ? this._selectedWidget.domNode : null;
        if(absolute && domNode && event && event.shiftKey){
            var widgetLeft = domNode.offsetLeft;
            var widgetTop = domNode.offsetTop;
            var node = domNode.offsetParent;
            while(node && node.tagName != 'BODY'){
            	widgetLeft += node.offsetLeft;
            	widgetTop += node.offsetTop;
            	node = node.offsetParent;
            }
            if(Math.abs(b.l - widgetLeft) >= Math.abs(b.t - widgetTop)){
            	b.t = widgetTop;
            }else{
            	b.l = widgetLeft;
            }
        }

        dojo.style(this.domNode, {left: b.l + "px", top: b.t + "px"});

        var currentParent = null;
        if(this._selectedWidget){
        	currentParent = this._selectedWidget.getParent();
        }
        if(this._selectedWidget && event){
    		var parentListDiv = cp.parentListDivGet();
    		if(!parentListDiv){// Make sure there is a DIV into which list of parents should be displayed
    			parentListDiv = cp.parentListDivCreate(this._selectedWidget.type, absolute, currentParent);
     		}
    		var parentIframe = context.getParentIframe();
    		if(parentIframe){
    			// Ascend iframe's ancestors to calculate page-relative x,y for iframe
    			var offsetLeft = 0;
    			var offsetTop = 0;
    			var offsetNode = parentIframe;
    			while(offsetNode && offsetNode.tagName != 'BODY'){
                    offsetLeft += offsetNode.offsetLeft;
                    offsetTop += offsetNode.offsetTop;
                    offsetNode = offsetNode.offsetParent;
        		}
    			parentListDiv.style.left = (offsetLeft + event.pageX) + 'px';
    			parentListDiv.style.top = (offsetTop + event.pageY) + 'px';
            }
        }
        var doSnapLines = absolute;
        var showParentsPref = this._context.getPreference('showPossibleParents');
        var spaceKeyDown = cp.isSpaceKeyDown();
        var showCandidateParents = (!showParentsPref && spaceKeyDown) || (showParentsPref && !spaceKeyDown);
        if(this._mover && (doSnapLines || showCandidateParents) && event && this._selectedWidget){
            var data = {type:this._selectedWidget.type};
            var position = { x:event.pageX, y:event.pageY};
            var snapBox = {l:b.l, t:b.t, w:0, h:0};
            if(this._box && this._box.w && this._box.h){
                snapBox.w = this._box.w;
                snapBox.h = this._box.h;
            }
            // Call the dispatcher routine that updates snap lines and
            // list of possible parents at current (x,y) location
            this._context.dragMoveUpdate({
            		data:data,
            		eventTarget:event.target,
            		position:position,
            		absolute:absolute,
            		currentParent:currentParent,
             		rect:snapBox, 
            		doSnapLines:doSnapLines, 
            		doFindParentsXY:showCandidateParents});
        }else{
        	// If not showing snap lines or parents, then make sure they aren't showing
			context.dragMoveCleanup();
        }
        if(this._contexDiv){
            var x = b.w + 10;
            this._contexDiv.style.left = x + 'px';
            this._updateSubwidgetList();
        }
    },

    resize: function(box, widget){
		if(widget){
		    this._selectedWidget = widget;
		}
    	this._resize(box);
    	this._box = box;
    },

    _resize: function(box){
        if(!box){
            return;
        }

        var b = dojo.mixin({}, box);

        // Adjust for size of border when near the top left corner of the screen
        if(b.l < this.size){
            b.w -= this.size - b.l;
            b.l = this.size;
        }
        if(b.t < this.size){
            b.h -= this.size - b.t;
            b.t = this.size;
        }

        if("l" in box && "t" in box){
            this.move({l: b.l, t: b.t});
        }

        // Width/height must not be less than 0 
        if(b.w < 0){
            b.w = 0;
        }
        if(b.h < 0){
            b.h = 0;
        }

        // Adjust for size of border when near the bottom/right corner of the screen
        var box_r = b.l + b.w + this.size;
        var box_b = b.t + b.h + this.size;
        var widget = this._selectedWidget;
        var body = widget ? widget.domNode.ownerDocument.body : null;
        if(body){
        	if(box_r > body.offsetWidth){
        		b.w -= (box_r - body.offsetWidth);
        	}
        	if(box_b > body.offsetHeight){
        		b.h -= (box_b - body.offsetHeight);
        	}
        }
        
        var h = b.h + this.size * 2;
        this._frames[LEFT].style.height = h + "px";
        this._frames[RIGHT].style.height = h + "px";
        this._frames[RIGHT].style.left = b.w + "px";
        this._frames[TOP].style.width = b.w + "px";
        this._frames[BOTTOM].style.top = b.h + "px";
        this._frames[BOTTOM].style.width = b.w + "px";

        var l = Math.round(b.w / 2 - this.size / 2);
        var t = Math.round(b.h / 2 - this.size / 2);
        this._nobs[LEFT].style.top = t + "px";
        this._nobs[RIGHT].style.left = b.w + "px";
        this._nobs[RIGHT].style.top = t + "px";
        this._nobs[TOP].style.left = l + "px";
        this._nobs[BOTTOM].style.left = l + "px";
        this._nobs[BOTTOM].style.top = b.h + "px";
        this._nobs[LEFT_BOTTOM].style.top = b.h + "px";
        this._nobs[RIGHT_TOP].style.left = b.w + "px";
        this._nobs[RIGHT_BOTTOM].style.left = b.w + "px";
        this._nobs[RIGHT_BOTTOM].style.top = b.h + "px";
    },
    
    
    show: function(widget, inline){
        //debugger;
        this.domNode.style.display = "block";
        this._selectedWidget = widget;
        if (inline) {
            this.showInline(widget); // sometimes the widget changes from undo/redo som get the current widget
        } else {
            delete this._inline; // delete any old inline kicking around
        }
    },

    showInline: function(widget) {

        this._selectedWidget = widget;
        this._inline = davinci.ve.metadata.queryDescriptor(widget.type, "inlineEdit");
        if (this._inline && this._inline.show) {
            this._inline.show(widget.id);
        }
        return;
    },


    hide: function(inline){

        this.domNode.style.display = "none";
        this._displayedWidget = null;
        if (this._inline){
            this._inline.hide();
            delete this._inline;
        
        }

    },
    
    allow: function(op){
        if(!op){
            return;
        }
        this._op = op;

        var cursor = (op.move ? "move" : "auto");
        dojo.forEach(this._frames, function(f){
            f.style.cursor = cursor;
        });

        var horizontal = (op.resizeWidth ? "block" : "none");
        var vertical = (op.resizeHeight ? "block" : "none");
        var corner = (op.resizeWidth && op.resizeHeight ? "block" : "none");
        this._nobs[LEFT].style.display = horizontal;
        this._nobs[RIGHT].style.display = horizontal;
        this._nobs[TOP].style.display = vertical;
        this._nobs[BOTTOM].style.display = vertical;
        this._nobs[LEFT_TOP].style.display = corner;
        this._nobs[LEFT_BOTTOM].style.display = corner;
        this._nobs[RIGHT_TOP].style.display = corner;
        this._nobs[RIGHT_BOTTOM].style.display = corner;
    },
	
    onMouseDown: function(event){
		this._removeKeyHandlers();

        // not to start Mover on the context menu
        if(event.button === 2 || event.ctrlKey){
            return;
        }
        this._shiftKey = false;

        if(dojo.indexOf(this._frames, event.target) >= 0){
            this._nobIndex = -1;
            if(this._op && this._op.move){
                new dojo.dnd.Mover(this.domNode, event, this);
            }
            dojo.stopEvent(event);
            
        }else{
            this._nobIndex = dojo.indexOf(this._nobs, event.target);
            if(this._nobIndex >= 0){
                new dojo.dnd.Mover(event.target, event, this);
                switch(this._nobIndex){
                case LEFT:
                case LEFT_BOTTOM:
                    this._nobBox = {l: -this.size};
                    break;
                case TOP:
                case RIGHT_TOP:
                    this._nobBox = {t: -this.size};
                    break;
                case LEFT_TOP:
                    this._nobBox = {l: -this.size, t: -this.size};
                    break;
                }
                dojo.stopEvent(event);
                
                var userdoc = this._context.getDocument();	// inner document = user's document
                userdoc.defaultView.focus();	// Make sure the userdoc is the focus object for keyboard events
                this._keyDownHandler = dojo.connect(userdoc, "onkeydown", dojo.hitch(this, function(e){
                	this.onKeyDown(e);
                }));
                this._keyUpHandler = dojo.connect(userdoc, "onkeyup", dojo.hitch(this, function(widgetType, e){
                	this.onKeyUp(e);
                }));
            }
         }
     },

    onMouseUp: function(event){
        var context = this._context;
		var cp = context._chooseParent;
		this._lastEventTarget = null;
		this._removeKeyHandlers();
        if(this._updateTarget){
            clearTimeout(this._updateTarget);
            delete this._updateTarget;
        }
        this._nobs[DRAG_NOB].style.display = 'none';
        if(this._mover){
        	var box;
        	if(this._shiftKey){
        		box = dojo.mixin({}, this._constrained);
        	}else{
        		box = dojo.mixin({}, this._box);
        	}
            this._mover = undefined;
            switch(this._nobIndex){
            case -1: // frame
                this.onExtentChange(this, dojo.mixin({l: this._box.l, t: this._box.t}, this._client));
                break;
            default:
            	this.onExtentChange(this, box);
            }
        }
        this._nobIndex = -1;
        this._nobBox = null;
		context.dragMoveCleanup();
     	cp.parentListDivDelete();
    },
    
    onDblClick: function(event) {
        this.showInline(this._selectedWidget);
        event.stopPropagation();
    },

    onMove: function(mover, box, event){
        if(this._nobIndex < 0){ // frame
   
            // Turn on visibility of DRAG_NOB and set its position
            // at the current mouse position. The DRAG_NOB will always track the
            // current mouse location, whereas the current frame DIVs might
            // jump around due to constraint logic if shift key is down
            // which would prevent it from noticing the mouseUp event.
            var drag_nob_style = this._nobs[DRAG_NOB].style;
            drag_nob_style.display = '';
            drag_nob_style.left = (event.pageX - this.domNode.offsetLeft - this.size/2) + 'px';
            drag_nob_style.top = (event.pageY - this.domNode.offsetTop - this.size/2) + 'px';

            this.move(box, event);
            this._client = {x: event.clientX, y: event.clientY};
            if(!this._updateTarget){

                this._updateTarget = setTimeout(dojo.hitch(this, function(){
                    this.onExtentChange(this, this._client, true);
                    delete this._updateTarget;
                }), 200);
            }
        }else{
			var b = dojo.mixin({}, this._box);
            var d = 0;
            switch(this._nobIndex){
            case LEFT:
                d = box.l - this._nobBox.l;
                this._nobBox.l = box.l;
                b.l += d;
                b.w -= d;
                break;
            case RIGHT:
                b.w = box.l;
                break;
            case TOP:
                d = box.t - this._nobBox.t;
                this._nobBox.t = box.t;
                b.t += d;
                b.h -= d;
                break;
            case BOTTOM:
                b.h = box.t;
                break;
            case LEFT_TOP:
                d = box.l - this._nobBox.l;
                this._nobBox.l = box.l;
                b.l += d;
                b.w -= d;
                d = box.t - this._nobBox.t;
                this._nobBox.t = box.t;
                b.t += d;
                b.h -= d;
                break;
            case LEFT_BOTTOM:
                d = box.l - this._nobBox.l;
                this._nobBox.l = box.l;
                b.l += d;
                b.w -= d;
                b.h = box.t;
                break;
            case RIGHT_TOP:
                b.w = box.l;
                d = box.t - this._nobBox.t;
                this._nobBox.t = box.t;
                b.t += d;
                b.h -= d;
                break;
            case RIGHT_BOTTOM:
                b.w = box.l;
                b.h = box.t;
                break;
            }
            dojo.mixin(this._box, b);
            dojo.mixin(this._constrained, b);
            if(this._selectedWidget && this._selectedWidget.type === 'html.img'){
            	var domNode = this._selectedWidget.domNode;
            	var naturalWidth = domNode.naturalWidth;
            	var naturalHeight = domNode.naturalHeight;
            	if(typeof naturalHeight == 'number' && naturalHeight > 0 && typeof naturalWidth == 'number' && naturalWidth > 0){
            		var aspectRatio = naturalWidth / naturalHeight;
            		if(b.w < aspectRatio * b.h){
            			this._constrained.w = b.h * aspectRatio;
            		}else{
            			this._constrained.h = b.w / aspectRatio;
            		}
            	}
            }else{
            	switch(this._nobIndex){
	                case LEFT:
	                case RIGHT:
		                this._constrained.h = b.w;
		                break;
	                case TOP:
	                case BOTTOM:
		                this._constrained.w = b.h;
		                break;
	                default:
	                	// If dragging corner, use max
		                if(b.w > b.h){
		                	this._constrained.h = b.w;
		                }else{
		                	this._constrained.w = b.h;
		                }
		                break;
            	}
            }
            this._resize(event.shiftKey ? this._constrained : this._box);
        }

    },

    onFirstMove: function(mover){
        this._mover = mover;
    },

    //Required for Moveable interface 
    onMoveStart: function(mover){
    },

    //Required for Moveable interface
    onMoveStop: function(mover){
    },
    
    onKeyDown: function(event){
		if(event){
	    	dojo.stopEvent(event);
	    	if(event.keyCode == 16){
	        	this._shiftKey = true;
	        	this._resize(this._constrained);   		
	    	}
		}else{
			// If event is undefined, something is wrong - remove the key handlers
			this._removeKeyHandlers();
		}
    },
    
    onKeyUp: function(event){
		if(event){
	    	dojo.stopEvent(event);
	    	if(event.keyCode == 16){
		    	this._shiftKey = false;
		       	this._resize(this._box);
	    	}
		}else{
			// If event is undefined, something is wrong - remove the key handlers
			this._removeKeyHandlers();
		}
    },
    
    _removeKeyHandlers: function(){
		if(this._keyDownHandler){
			dojo.disconnect(this._keyDownHandler);
			this._keyDownHandler = null;
		}
		if(this._keyUpHandler){
			dojo.disconnect(this._keyUpHandler);
			this._keyUpHandler = null;
		}
    },

    onExtentChange: function(focus, box){
    },
    
    showContext: function(context, widget){
        if(!this._contexDiv){
            this._context = context;
            //this._selectedWidget = null;
            this._createContextPopUp();
        }
        this._contexDiv.style.display = "block";
    },
    
    hideContext: function(){
        if(this._contexDiv){
            this._contexDiv.style.display = "none";
        }
    },
    
    _createContextPopUp: function(){
        
        var contexDiv= dojo.doc.createElement("div");
        contexDiv.id = 'ieb';
        this._contexDiv = contexDiv;
        this.domNode.appendChild(contexDiv);

    },
    _createSubwidgetList: function() {
        //if(this._cm)return;

        var contexDiv=this._contexDiv;
        contexDiv.innerHTML = '<span></span>';
        contexDiv.style.position = "absolute";
        var x = this._box.w + 10;
        contexDiv.style.left = x + 'px';
        contexDiv.className = "themeSubwidgetMenu";
        dojo.connect(contexDiv, "onmousedown", this, "stopPropagation");
        //contexDiv.style.zIndex = "115";
        contexDiv.style.display = "none";
        this._contexDiv = contexDiv;
        this.domNode.appendChild(contexDiv);
        var span = this._contexDiv.firstElementChild,
            menuId = this._context._themeName + '_subwidgetmenu',
            pMenu = dijit.byId(menuId);
        if (pMenu) {
            pMenu.destroyRecursive(false);
        }
        // get the version of dijit that the theme editor html template is using.
        // if we don't when we create the subwidget menu dojo/resources/blank.gif can't be found 
        // and we have no check boxes on FF
        var localDijit = this._context.getDijit();
        //pMenu = new dijit.Menu({ id:menuId  },span);
        pMenu = new localDijit.Menu({id:menuId}, span);

        var widget = this._context._selectedWidget;
        this._displayedWidget = widget;
        //var editor = davinci.Runtime.currentEditor;

        var themeMetadata = this._context.getThemeMeta().metadata;
        var widgetType = themeMetadata.getWidgetType(widget);
        var widgetMetadata = themeMetadata.getMetadata(widgetType);
        var subwidgets = widgetMetadata.subwidgets;

        if(subwidgets){
            //var item = new dijit.CheckedMenuItem({
            var checked = false;
            if (!widget.subwidget) {
                checked = true; // no subwidget selected
            }
            var item = new localDijit.CheckedMenuItem({
                label: 'WidgetOuterContainer',
                id: this._context._themeName + '_WidgetOuterContainer',
                checked: checked,
                onClick: dojo.hitch(this, "_subwidgetSelected")
            });
            pMenu.addChild(item);
            this._currentItem = item;
            //pMenu.addChild(new dijit.MenuSeparator());
            for (var s in subwidgets){
                //pMenu.addChild(new dijit.CheckedMenuItem({
                checked = (widget.subwidget === s);
                var menuItem = new localDijit.CheckedMenuItem({
                    label: s,
                    id: this._context._themeName + '_' + s,
                    checked: checked,
                    onClick: dojo.hitch(this, "_subwidgetSelected")
                });
                pMenu.addChild(menuItem);
                if (checked) {
                    this._currentItem = menuItem;
                }
            }
        }

        pMenu.startup();
        this._cm = pMenu;
        this._updateSubwidgetListForState();
        this._connections = [];
        this._connections.push(dojo.subscribe("/davinci/ui/subwidgetSelectionChanged",dojo.hitch(this,this._subwidgetSelectedChange)));
        this._connections.push(dojo.subscribe("/davinci/states/state/changed", dojo.hitch(this, this._updateSubwidgetListForState)));
    },

    stopPropagation: function(e){
        e.stopPropagation();
    },
    
    _subwidgetSelected: function(e){
        e.stopPropagation();
        var localDijit = this._context.getDijit();
        var item = localDijit.byId(e.currentTarget.id);
        //var item = dijit.byId(e.currentTarget.id);
        var subwidget;
        if (item.checked){
            if (this._currentItem && item != this._currentItem) {
                this._currentItem.set("checked", false);
            }
            this._currentItem = item;
            subwidget = this._currentItem.label;
        } else {
            //this._currentItem = dijit.byId(this._context._themeName + '_WidgetOuterContainer');
            this._currentItem = localDijit.byId(this._context._themeName + '_WidgetOuterContainer');
            if (this._currentItem) {
                this._currentItem.set("checked", true);
            }
            subwidget = null;
        }
        if (e.currentTarget.id === (this._context._themeName + '_WidgetOuterContainer')){
            subwidget = null;
        }
        dojo.publish("/davinci/ui/subwidgetSelectionChanged",[{subwidget: subwidget, origin: this.declaredClass}]);
            
       
    },
    
    _subwidgetSelectedChange: function(e){

        var localDijit = this._context.getDijit();
        if (e.origin ===  this.declaredClass){
            // must be our own message
            return;
        } else {
            if (this._currentItem) {
                this._currentItem.set("checked", false); // unset the one we have
            }
            if (e.subwidget){
                this._currentItem = localDijit.byId(this._context._themeName + '_' + e.subwidget);
                if (this._currentItem) {
                    this._currentItem.set("checked", true);
                }
            } else{
                this._currentItem = localDijit.byId(this._context._themeName + '_WidgetOuterContainer');
                if (this._currentItem) {
                    this._currentItem.set("checked", true);
                }
                //this._currentItem = null;
            }
        }
    },
    
    
    _updateSubwidgetListForState: function() {
        if ((this._displayedWidget) && (this._displayedWidget === this._context._selectedWidget)) { // #1024 exception
            var editor = davinci.Runtime.currentEditor,
                themeMetadata = editor._theme;
            this._cm.getChildren().forEach(function(child) {
                var subwidget = child.label;
                if (subwidget === 'WidgetOuterContainer') {
                    subwidget = null;
                }
                child.setDisabled(
                    !themeMetadata.isStateValid(
                        this._displayedWidget,
                        editor._currentState,
                        subwidget));
            }, this);
        } else {
            this._clearList();
            this._createSubwidgetList();
        }
    },
    
    _updateSubwidgetList: function() {
        if (this._displayedWidget === this._context._selectedWidget) { return; } // we are already displaying the subwidgets
        this._clearList();
        this._createSubwidgetList();
    },
    
    _clearList: function() {
        if (this._cm){
            this._cm.destroyRecursive(false);
            delete this._cm;
            while (connection = this._connections.pop()){
                dojo.unsubscribe(connection);
            }
        }
        this._currentItem = null;
    }
});

})();
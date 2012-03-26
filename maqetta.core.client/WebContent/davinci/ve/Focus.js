define([
    "require",
    "dojo/_base/declare",
	"dijit/_WidgetBase",
	"dojo/dnd/Mover",
	"./metadata"
],
function(require, declare, _WidgetBase, Mover, Metadata) {
    
// Nobs
var LEFT_TOP = 0,
    LEFT_BOTTOM = 1,
    RIGHT_TOP = 2,
    RIGHT_BOTTOM = 3,
	DRAG_NOB = 4;	// Overlay nob that follows mouse during drag operation
// Sides
var LEFT = 0,
    RIGHT = 1,
    TOP = 2,
    BOTTOM = 3;

return declare("davinci.ve.Focus", _WidgetBase, {

    size: 6,
    baseClass: "maqFocus",

    postCreate: function(){
        if(this.size < 2){
            this.size = 2;
        }

        dojo.style(this.domNode, {position: "absolute", display: "none"}); // FIXME: use CSS class to change display property

        this._frames = [];
        for(var i = 0; i < 4; i++){
            var frame = dojo.create("div", {"class": "editFocusFrame"}, this.domNode);
            this._frames.push(frame);
            this.connect(frame, "onmousedown", "onMouseDown");
            this.connect(frame, "onmouseup", "onMouseUp");
            this.connect(frame, "ondblclick", "onDblClick");
        }
        dojo.addClass(this._frames[LEFT], "editFocusFrameLEFT");
        dojo.addClass(this._frames[RIGHT], "editFocusFrameRIGHT");
        dojo.addClass(this._frames[TOP], "editFocusFrameTOP");
        dojo.addClass(this._frames[BOTTOM], "editFocusFrameBOTTOM");
        
        this._nobs = [];
        var cursors = ["nw-resize", "sw-resize", "ne-resize", "se-resize"];
        var border = (dojo.isIE ? 0 : 2);
        for(var i = 0; i < 5; i++){
            var nob = dojo.create("div", {"class": "editFocusNob", style: {
                cursor: cursors[i]
            }}, this.domNode);
            this._nobs.push(nob);
            this.connect(nob, "onmousedown", "onMouseDown");
            this.connect(nob, "onmouseup", "onMouseUp");
        }
        this._nobs[DRAG_NOB].style.display = 'none';	// Becomes visible upon mousedown when dragging frame
        this._nobs[DRAG_NOB].style.background = 'transparent';
        this._nobs[DRAG_NOB].style.border = 'none';
        
        var offset = -11;
        this._nobs[LEFT_TOP].style.left =
            this._nobs[LEFT_TOP].style.top =
            this._nobs[LEFT_BOTTOM].style.left =
            this._nobs[RIGHT_TOP].style.top = offset + "px";
        this._nobIndex = -1;
        this._frameIndex = -1;
		
		this._custom = dojo.create("div", {"class": "editFocusCustom"}, this.domNode);

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
            // Short-term hack just before M5 to prevent reference through null
            // error in case current widget's domNode doesn't have a computed style
            var position_prop = this.dojoStyle(this._selectedWidget.domNode,"position");
        }
        var absolute = (position_prop=="absolute");
        var doSnapLinesX = absolute;
        var doSnapLinesY = absolute;

        // Constrained movement in x or y if shift key is down
        var domNode = this._selectedWidget ? this._selectedWidget.domNode : null;
        if(absolute && domNode && event && event.shiftKey){
            // Need to subtract off margins
            var marginLeft = Number(dojo.style(domNode, 'marginLeft'));
            var marginTop = Number(dojo.style(domNode, 'marginTop'));
            var widgetLeft = domNode.offsetLeft - marginLeft;
            var widgetTop = domNode.offsetTop - marginTop;
            var node = domNode.offsetParent;
            while(node && node.tagName != 'BODY'){
            	widgetLeft += node.offsetLeft;
            	widgetTop += node.offsetTop;
            	node = node.offsetParent;
            }
            var deltaX = Math.abs(b.l - widgetLeft);
            var deltaY = Math.abs(b.t - widgetTop);
            var CONSTRAIN_MIN_DIST = 3;	// constrained dragging only active if user moves object non-trivial amount
            if(deltaX >= deltaY && deltaX > CONSTRAIN_MIN_DIST){
            	b.t = widgetTop;
            	doSnapLinesY = false;
            }else if(deltaY >= deltaX && deltaY > CONSTRAIN_MIN_DIST){
            	b.l = widgetLeft;
            	doSnapLinesX = false;
            }
        }

        // Short-term hack just before M5 to prevent reference through null
        // error in case current widget's domNode doesn't have a computed style
        this.dojoStyle(this.domNode, {left: b.l + "px", top: b.t + "px"});

        var currentParent = null;
        if(this._selectedWidget){
        	currentParent = this._selectedWidget.getParent();
        }
        if(this._selectedWidget && event){
        	var widgetType = this._selectedWidget.type;
        	var dropCursor = Metadata.queryDescriptor(widgetType, "dropCursor");
    		var doCursor = !absolute;
    		if (typeof this._dropCursor == 'object' && this._dropCursor.show === false){
    			doCursor = false;
    		}
    		var beforeAfter = this._dropCursor && this._dropCursor.beforeAfter;
    		var parentListDiv = cp.parentListDivGet();
    		if(!parentListDiv){// Make sure there is a DIV into which list of parents should be displayed
    			parentListDiv = cp.parentListDivCreate({
    				widgetType:widgetType, 
    				absolute:absolute, 
    				doCursor:doCursor, 
    				beforeAfter:beforeAfter, 
    				currentParent:currentParent });
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
        var showParentsPref = this._context.getPreference('showPossibleParents');
        var spaceKeyDown = cp.isSpaceKeyDown();
        var showCandidateParents = (!showParentsPref && spaceKeyDown) || (showParentsPref && !spaceKeyDown);
        if(this._mover && event && this._selectedWidget){
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
            		widgets:[this._selectedWidget],
            		data:data,
            		eventTarget:event.target,
            		position:position,
            		absolute:absolute,
            		currentParent:currentParent,
             		rect:snapBox, 
            		doSnapLinesX:doSnapLinesX, 
            		doSnapLinesY:doSnapLinesY, 
            		doFindParentsXY:showCandidateParents,
            		doCursor:!absolute});
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
		
		// bboxActual is box before adjustments
		this._bboxActual = {l:b.l, t:b.t};

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
		this._bboxActual.w = b.w;
		this._bboxActual.h = b.h;

        // Adjust for size of border when near the bottom/right corner of the screen
        var box_r = b.l + b.w + this.size;
        var box_b = b.t + b.h + this.size;
        var widget = this._selectedWidget;
        var htmlElem = widget ? widget.domNode.ownerDocument.body.parentNode : null;
        if(htmlElem){
        	if(box_r > htmlElem.scrollWidth){
        		b.w -= (box_r - htmlElem.scrollWidth);
        	}
        	if(box_b > htmlElem.scrollHeight){
        		b.h -= (box_b - htmlElem.scrollHeight);
        	}
        }
        
        var w = b.w + this.size * 2;
        var h = b.h + this.size * 2;
        this._frames[LEFT].style.height = h + "px";
        this._frames[RIGHT].style.height = h + "px";
        this._frames[RIGHT].style.left = b.w + "px";
        this._frames[TOP].style.width = w + "px";
        this._frames[BOTTOM].style.top = b.h + "px";
        this._frames[BOTTOM].style.width = w + "px";

        var l = Math.round(b.w / 2 - this.size / 2);
        var t = Math.round(b.h / 2 - this.size / 2);
        this._nobs[LEFT_BOTTOM].style.top = b.h + "px";
        this._nobs[RIGHT_TOP].style.left = b.w + "px";
        this._nobs[RIGHT_BOTTOM].style.left = b.w + "px";
        this._nobs[RIGHT_BOTTOM].style.top = b.h + "px";
		
		this._bboxAdjusted = b;
    },
    
    
    show: function(widget, inline){
        //debugger;
        if (!widget){
            // sometimes you get no widget when  DnD in split screen
            return; 
        }
		this._custom.innerHTML = '';
        this.domNode.style.display = "block";
        this._selectedWidget = widget;
		var helper = widget.getHelper();
		var delete_inline = true;
		if(helper && helper.onShowSelection){
			helper.onShowSelection({widget:widget, customDiv:this._custom,
				bboxActual:this._bboxActual, bboxAdjusted:this._bboxAdjusted});
		}
        if (inline) {
            this.showInline(widget); // sometimes the widget changes from undo/redo som get the current widget
			delete_inline = false;
		}
		if(delete_inline){
            delete this._inline; // delete any old inline kicking around
        }
    },

    showInline: function(widget) {
        this._selectedWidget = widget;
        var context = this._context;
        var self = this;
        Metadata.getSmartInput(widget.type).then(function(inline) {
        	if (!inline) {
        		return;
        	}
            self._inline = inline;
            if (inline.useParent) {
                var parentWidget = widget.getParent();
                if (parentWidget) {
                    context.deselect(widget);
                    context.select(parentWidget);
                    var parentFocusObject = context.getFocus(parentWidget);
                    parentFocusObject.showInline(parentWidget);
                }
            } else if (inline.show) {
                inline.show(widget.id);
            }
        });
    },


	inlineEditActive: function(){
		if(this._inline && this._inline.inlineEditActive){
			return this._inline.inlineEditActive();
		}else{
			return false;
		}
		
	},

    hide: function(inline){

		var widget = this._selectedWidget;
		var helper = widget ? widget.getHelper() : undefined;
		if(helper && helper.onHideSelection){
			// Don't know if any widgets actually use this helper
			// Included for completeness
			helper.onHideSelection({widget:widget, customDiv:this._custom});
		}
        this.domNode.style.display = "none";
		this._selectedWidget = null;	// Used by page editor
		this._displayedWidget = null;	// Used by theme editor
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

        var corner = (op.resizeWidth && op.resizeHeight ? "block" : "none");
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
		// Only process mousedown events when SelectTool is active
		// Mostly to allow CreateTool to drag out widget initial size even
		// when mouse is over focus nodes
		if(this._context._activeTool.declaredClass != 'davinci.ve.tools.SelectTool'){
			return;
		}
		this._shiftKey = false;

		this._nobIndex = dojo.indexOf(this._nobs, event.target);
		this._frameIndex = dojo.indexOf(this._frames, event.target);
        /*
        if(dojo.indexOf(this._frames, event.target) >= 0){
            this._nobIndex = -1;
            if(this._op && this._op.move){
                new Mover(this.domNode, event, this);
            }
            dojo.stopEvent(event);
            
        }else{
            if(this._nobIndex >= 0){
        */
		new Mover(event.target, event, this);
		if(this._frameIndex === LEFT || this._nobIndex === LEFT_BOTTOM){
			this._nobBox = {l: -this.size};
		}else if(this._frameIndex === TOP || this._nobIndex === RIGHT_TOP){
			this._nobBox = {t: -this.size};
		}else if(this._nobIndex === LEFT_TOP){
			this._nobBox = {l: -this.size, t: -this.size};
		}
		dojo.stopEvent(event);

		var userdoc = this._context.getDocument();	// inner document = user's document
		userdoc.defaultView.focus();	// Make sure the userdoc is the focus object for keyboard events
		this._keyDownHandler = dojo.connect(userdoc, "onkeydown", dojo.hitch(this, function(e){
			this.onKeyDown(e);
		}));
		this._keyUpHandler = dojo.connect(userdoc, "onkeyup", dojo.hitch(this, function(e){
			this.onKeyUp(e);
		}));
/*
            }
         }
*/
     },

    onMouseUp: function(event){
        var context = this._context;
		var cp = context._chooseParent;
		this._lastEventTarget = null;
		this._removeKeyHandlers();
        this._nobs[DRAG_NOB].style.display = 'none';
        if(this._mover){
        	var box;
        	if(this._shiftKey){
        		box = dojo.mixin({}, this._constrained);
        	}else{
        		box = dojo.mixin({}, this._box);
        	}
            this._mover = undefined;
            /*
            switch(this._nobIndex){
            case -1: // frame
                this.onExtentChange(this, dojo.mixin({l: this._box.l, t: this._box.t}, this._client));
                break;
            default:
            */
            	this.onExtentChange(this, box);
            /*
            }
            */
        }
		context.dragMoveCleanup();
     	cp.parentListDivDelete();
        this._nobIndex = -1;
        this._frameIndex = -1;
        this._nobBox = null;
    },
    
    onDblClick: function(event) {
        this.showInline(this._selectedWidget);
        event.stopPropagation();
    },

    onMove: function(mover, box, event){
/*FIXME: Does any of this logic need to move to SelectTool.js?
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

        }else{
*/
		var b = dojo.mixin({}, this._box);
		var d = 0;
console.log('onMove: this._nobIndex='+this._nobIndex+',this._frameIndex='+this._frameIndex);
		if(this._frameIndex === LEFT){
console.log('onMove: LEFT');
			d = box.l - this._nobBox.l;
			this._nobBox.l = box.l;
			b.l += d;
			b.w -= d;
		}else if(this._frameIndex === RIGHT){
console.log('onMove: RIGHT');
			b.w = box.l;
		}else if(this._frameIndex === TOP){
console.log('onMove: TOP');
			d = box.t - this._nobBox.t;
			this._nobBox.t = box.t;
			b.t += d;
			b.h -= d;
		}else if(this._frameIndex === BOTTOM){
console.log('onMove: BOTTOM');
			b.h = box.t;
		}else if(this._nobIndex === LEFT_TOP){
console.log('onMove: LEFT_TOP');
			d = box.l - this._nobBox.l;
			this._nobBox.l = box.l;
			b.l += d;
			b.w -= d;
			d = box.t - this._nobBox.t;
			this._nobBox.t = box.t;
			b.t += d;
			b.h -= d;
		}else if(this._nobIndex === LEFT_BOTTOM){
console.log('onMove: LEFT_BOTTOM');
			d = box.l - this._nobBox.l;
			this._nobBox.l = box.l;
			b.l += d;
			b.w -= d;
			b.h = box.t;
		}else if(this._nobIndex === RIGHT_TOP){
console.log('onMove: RIGHT_TOP');
			b.w = box.l;
			d = box.t - this._nobBox.t;
			this._nobBox.t = box.t;
			b.t += d;
			b.h -= d;
		}else if(this._nobIndex === RIGHT_BOTTOM){
console.log('onMove: RIGHT_BOTTOM');
			b.w = box.l;
			b.h = box.t;
		}
		dojo.mixin(this._box, b);
		dojo.mixin(this._constrained, b);
		if(this._selectedWidget && this._selectedWidget.domNode.nodeName === 'IMG'){
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
			if(this._frameIndex === LEFT || this._frameIndex === RIGHT){
				this._constrained.h = b.w;
			}else if(this._frameIndex === TOP || this._frameIndex === BOTTOM){
				this._constrained.w = b.h;
			}else{
				// If dragging corner, use max
				if(b.w > b.h){
					this._constrained.h = b.w;
				}else{
					this._constrained.w = b.h;
				}
			}
		}
		this._resize(event.shiftKey ? this._constrained : this._box);
/*
        }
*/
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
    //FIXME: should this code be delegated to themeEditor somehow? This was moved here for future use by the page editor. 
    // If the page editor every supports styling supwidgets...
    _createSubwidgetList: function() {
        //if(this._cm)return;
        var widget = this._context._selectedWidget;
        if (!widget) {
        	return;
        }
        var themeMetadata = this._context.getThemeMeta().metadata;
        var widgetType = themeMetadata.getWidgetType(widget);
        var widgetMetadata = themeMetadata.getMetadata(widgetType);
        var subwidgets = widgetMetadata.subwidgets;
        
        this._displayedWidget = widget;
        if(subwidgets){
            var contexDiv=this._contexDiv;
            contexDiv.innerHTML = '<span></span>';
            contexDiv.style.position = "absolute";
            var x = this._box.w + 10;
            contexDiv.style.left = x + 'px';
            contexDiv.className = "themeSubwidgetMenu";
            dojo.connect(contexDiv, "onmousedown", this, "stopPropagation");
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
            pMenu = new localDijit.Menu({id:menuId}, span);
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
            for (var s in subwidgets){
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
            pMenu.startup();
            this._cm = pMenu;
            this._updateSubwidgetListForState();
            this._connections = [];
            this._connections.push(dojo.subscribe("/davinci/ui/subwidgetSelectionChanged",dojo.hitch(this,this._subwidgetSelectedChange)));
            this._connections.push(dojo.subscribe("/davinci/states/state/changed", dojo.hitch(this, this._updateSubwidgetListForState)));
        }

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
        if (this._context._selectedWidget && this._displayedWidget === this._context._selectedWidget) {
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
    },
    
    // FIXME: Temporary hack just before M5 release
    // Front-end to dojo.style that prevents possible reference through undefined
    dojoStyle: function(node, name, value){
    	if(node && node.ownerDocument && node.ownerDocument.defaultView){
    		var win = node.ownerDocument.defaultView;
    		var cs = win.getComputedStyle(node);
    		if(cs){
    			return dojo.style.apply(dojo, arguments);
    		}
    	}
    }
});

});

define([
	"require",
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dojo/dnd/Mover",
	"./metadata"
],
function(require, declare, _WidgetBase, Mover, Metadata) {
	
// Nobs and frame constants
	var LEFT = 0,	// nob and frame
	RIGHT = 1,
	TOP = 2,
	BOTTOM = 3,
	LEFT_TOP = 4,	// nob only
	LEFT_BOTTOM = 5,
	RIGHT_TOP = 6,
	RIGHT_BOTTOM = 7;

return declare("davinci.ve.Focus", _WidgetBase, {

	// Inside knowledge about CSS classes used to style editFocusNob and editFocusFrame DIVs
	nobSize:11,
	frameSize:6,

	postCreate: function(){
		dojo.addClass(this.domNode, 'maqFocus');
		dojo.style(this.domNode, {position: "absolute", display: "none"}); // FIXME: use CSS class to change display property
		this._stdChrome = dojo.create("div", {"class": "editFocusStdChrome"}, this.domNode);
		
		this._frames = [];
		for(var i = 0; i < 4; i++){
			var frame = dojo.create("div", {"class": "editFocusFrame"}, this._stdChrome);
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
		var cursors = ["w-resize","e-resize","n-resize","s-resize","nw-resize", "sw-resize", "ne-resize", "se-resize"];
		var border = (dojo.isIE ? 0 : 2);
		for(var i = 0; i < 8; i++){
			var nob = dojo.create("div", {"class": "editFocusNob", style: {
				cursor: cursors[i]
			}}, this._stdChrome);
			this._nobs.push(nob);
			this.connect(nob, "onmousedown", "onMouseDown");
			this.connect(nob, "onmouseup", "onMouseUp");
		}
		this._nobIndex = -1;
		this._frameIndex = -1;
		
		this._custom = dojo.create("div", {"class": "editFocusCustom"}, this.domNode);
	},

	resize: function(box, widget){
		if(widget){
		    this._selectedWidget = widget;
		}
		this._moverCurrent = { l:box.l, t:box.t, w:box.w, h:box.h };
		this._moverCurrentConstrained = dojo.mixin({}, this._moverCurrent);
		this._updateFocusChrome(this._moverCurrent, true /*offScreenAdjust*/);
		if(this._contexDiv){	// Theme editor only
			var x = box.w + 10;
			this._contexDiv.style.left = x + 'px';
			this._updateSubwidgetList();
		}
		this._box = box;	// Only used by theme editor's subwidget logic
	},

	show: function(widget, inline){
		//debugger;
		if (!widget){
			// sometimes you get no widget when  DnD in split screen
			return; 
		}
		this._custom.innerHTML = '';
		var showStandardSelectionChrome = Metadata.queryDescriptor(widget.type, "showStandardSelectionChrome");
		this._stdChrome.style.display = (showStandardSelectionChrome === false) ? 'none' : 'block';
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
			if(!inline){
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

        var horizontal = (op.resizeWidth && !op.resizeHeight) ? "block" : "none";
        var vertical = (op.resizeHeigh && !op.resizeWidth) ? "block" : "none";
        var corner = (op.resizeWidth && op.resizeHeight) ? "block" : "none";
        this._nobs[LEFT].style.display = horizontal;
        this._nobs[RIGHT].style.display = horizontal;
        this._nobs[TOP].style.display = vertical;
        this._nobs[BOTTOM].style.display = vertical;
        this._nobs[LEFT_TOP].style.display = corner;
        this._nobs[LEFT_BOTTOM].style.display = corner;
        this._nobs[RIGHT_TOP].style.display = corner;
        this._nobs[RIGHT_BOTTOM].style.display = corner;
    },

	/**
	 * Update the position of the various DIVs that make up the selection chrome
	 * @param {object} rect - location/size for currently selected widget in form of {l:,t:,w:,h:}
	 * @param {boolean} offScreenAdjust - whether to pull selection in from off edge of canvas
	 */
	_updateFocusChrome: function(rect, offScreenAdjust){
		// Various constants leveraging knowledge about selection chrome CSS style rules
		var nobOffScreenAdjust = this.nobSize + 1;
		var frameOffScreenAdjusted = this.frameSize + 1;
		var normalFrameLeft = -6;
		var normalFrameTop = -6;
		var normalNobLeft = -11;
		var normalNobTop = -11;
		var frameSizeWidthAdjust = 4;
		var frameSizeBorderAdjust = 4;
		
		this.domNode.style.left = rect.l + 'px';
		this.domNode.style.top = rect.t + 'px';
		
		var nobLeftsideAdjustedLeft = normalNobLeft;
		var nobTopsideAdjustedTop = normalNobTop;
		var nobRightsideAdjustedLeft = rect.w;
		var nobBottomsideAdjustedTop = rect.h;
		var nobWidthAdjusted = rect.w;
		var nobHeightAdjusted = rect.h;
		var frameLeftsideLeftAdjusted = normalFrameLeft;
		var frameTopsideTopAdjusted = normalFrameTop;
		var frameRightsideAdjustedLeft = rect.w;
		var frameBottomsideAdjustedTop = rect.h;
		var frameWidthAdjusted = rect.w + frameSizeWidthAdjust + frameSizeBorderAdjust;
		var frameHeightAdjusted = rect.h + frameSizeWidthAdjust + frameSizeBorderAdjust;
		
		if(offScreenAdjust){
			// Determine if parts of selection are off screen
			// If so, shift selection DIVs to make it visible
			var farthestLest, farthestTop, farthestRight, farthestBottom;
			var bodyWidth = this.domNode.ownerDocument.body.offsetWidth;
			var bodyHeight = this.domNode.ownerDocument.body.offsetHeight;
			
			farthestLeft = rect.l - nobOffScreenAdjust;
			farthestTop = rect.t - nobOffScreenAdjust;
			var nobOffScreenAdjustLeft = farthestLeft < 0 ? -farthestLeft : 0;
			var nobOffScreenAdjustTop = farthestTop < 0 ? -farthestTop : 0;
			nobLeftsideAdjustedLeft += nobOffScreenAdjustLeft;
			nobTopsideAdjustedTop += nobOffScreenAdjustTop;
			
			farthestRight = rect.l + rect.w + nobOffScreenAdjust;
			farthestBottom = rect.t + rect.h + nobOffScreenAdjust;
			var nobRightAdjust = farthestRight > bodyWidth ? bodyWidth - farthestRight : 0;
			var nobBottomAdjust = farthestBottom > bodyHeight ? bodyHeight - farthestBottom : 0;
			nobRightsideAdjustedLeft += nobRightAdjust;	
			nobBottomsideAdjustedTop += nobBottomAdjust;

			farthestLeft = rect.l - frameOffScreenAdjusted;
			farthestTop = rect.t - frameOffScreenAdjusted;
			var frameOffScreenAdjustedLeft = farthestLeft < 0 ? -farthestLeft : 0;
			var frameOffScreenAdjustedTop = farthestTop < 0 ? -farthestTop : 0;
			frameLeftsideLeftAdjusted += frameOffScreenAdjustedLeft;
			frameTopsideTopAdjusted += frameOffScreenAdjustedLeft;
			
			farthestRight = rect.w + frameOffScreenAdjusted;
			farthestBottom = rect.h + frameOffScreenAdjusted;
			var frameRightAdjust = farthestRight > bodyWidth ? bodyWidth - farthestRight : 0;
			var frameBottomAdjust = farthestBottom > bodyHeight ? bodyHeight - farthestBottom : 0;
			frameRightsideAdjustedLeft += frameRightAdjust;	
			frameBottomsideAdjustedTop += frameBottomAdjust;
			farthestRight = frameOffScreenAdjustedLeft + frameWidthAdjusted;
			farthestBottom = frameOffScreenAdjustedTop + frameHeightAdjusted;
			var frameWAdjust = (farthestRight + frameSizeBorderAdjust) > bodyWidth ? bodyWidth - (farthestRight + frameSizeBorderAdjust) : 0;
			var frameHAdjust = (farthestBottom + frameSizeBorderAdjust) > bodyHeight ? bodyHeight - (farthestBottom + frameSizeBorderAdjust) : 0;
			frameWidthAdjusted += frameWAdjust;
			frameHeightAdjusted += frameHAdjust;
		}
		
		this._frames[LEFT].style.left =
			this._frames[TOP].style.left =
			this._frames[BOTTOM].style.left = frameLeftsideLeftAdjusted + "px";
		this._frames[LEFT].style.top =
			this._frames[TOP].style.top =
			this._frames[RIGHT].style.top = frameTopsideTopAdjusted + "px";
		this._frames[LEFT].style.height = frameHeightAdjusted + "px";
		this._frames[RIGHT].style.height = frameHeightAdjusted + "px";
		this._frames[RIGHT].style.left = frameRightsideAdjustedLeft + "px";
		this._frames[TOP].style.width = frameWidthAdjusted + "px";
		this._frames[BOTTOM].style.top = frameBottomsideAdjustedTop + "px";
		this._frames[BOTTOM].style.width = frameWidthAdjusted + "px";

		var l = Math.round(nobWidthAdjusted / 2 - this.nobSize / 2);
		var t = Math.round(nobHeightAdjusted / 2 - this.nobSize / 2);
		this._nobs[LEFT].style.left =
			this._nobs[LEFT_TOP].style.left =
			this._nobs[LEFT_BOTTOM].style.left = nobLeftsideAdjustedLeft + "px";
		this._nobs[TOP].style.top =
			this._nobs[LEFT_TOP].style.top =
			this._nobs[RIGHT_TOP].style.top = nobTopsideAdjustedTop + "px";
		this._nobs[LEFT].style.top = t + "px";
		this._nobs[RIGHT].style.left = nobRightsideAdjustedLeft + "px";
		this._nobs[RIGHT].style.top = t + "px";
		this._nobs[TOP].style.left = l + "px";
		this._nobs[BOTTOM].style.left = l + "px";
		this._nobs[BOTTOM].style.top = nobBottomsideAdjustedTop + "px";
		this._nobs[LEFT_BOTTOM].style.top = nobBottomsideAdjustedTop + "px";
		this._nobs[RIGHT_TOP].style.left = nobRightsideAdjustedLeft + "px";
		this._nobs[RIGHT_BOTTOM].style.left = nobRightsideAdjustedLeft + "px";
		this._nobs[RIGHT_BOTTOM].style.top = nobBottomsideAdjustedTop + "px";
	},

	onMouseDown: function(event){
		this._removeKeyHandlers();

		if(!this._selectedWidget || !this._selectedWidget.domNode){
			return;
		}
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
		this._shiftKey = event.shiftKey;

		this._nobIndex = dojo.indexOf(this._nobs, event.target);
		this._frameIndex = dojo.indexOf(this._frames, event.target);

		var moverDragDivSize = 100;
		var moverDragDivHalf = 50;
		var l = event.pageX - moverDragDivHalf;
		var t = event.pageY - moverDragDivHalf;
		var node = this._selectedWidget.domNode;
		this._moverStart = { moverLeft:l, moverTop:t,
				l:parseInt(this.domNode.style.left), t:parseInt(this.domNode.style.top),
				w:node.offsetWidth, h:node.offsetHeight };
		this._moverCurrent = dojo.mixin({}, this._moverStart);
		this._moverDragDiv = dojo.create('div', 
				{style:'position:absolute;z-index:2000000;background:transparent;left:'+l+'px;top:'+t+'px;width:'+moverDragDivSize+'px;height:'+moverDragDivSize+'px'},
				this._context.rootNode);
		this._mover = new Mover(this._moverDragDiv, event, this);
		dojo.stopEvent(event);

		var userdoc = this._context.getDocument();	// inner document = user's document
		userdoc.defaultView.focus();	// Make sure the userdoc is the focus object for keyboard events
		this._keyDownHandler = dojo.connect(userdoc, "onkeydown", dojo.hitch(this, function(e){
			this.onKeyDown(e);
		}));
		this._keyUpHandler = dojo.connect(userdoc, "onkeyup", dojo.hitch(this, function(e){
			this.onKeyUp(e);
		}));
	},

	onMove: function(mover, box, event){
		// Update the transparent overlay DIV that tracks mouse and
		// intercepts mouse events from activating widgets under mouse
		if(this._moverDragDiv){
			this._moverDragDiv.style.left = box.l + 'px';
			this._moverDragDiv.style.top = box.t + 'px';
		}
		
		// Recompute focus chrome's bounds for normal/unconstrained resizing (via dragging nob or frame)
		var start = this._moverStart;
		var dx = box.l - start.moverLeft;
		var dy = box.t - start.moverTop;
		if(this._frameIndex === LEFT || this._nobIndex === LEFT_TOP || this._nobIndex === LEFT || this._nobIndex === LEFT_BOTTOM){
			this._moverCurrent.l = start.l + dx;
			this._moverCurrent.w = start.w - dx;
		}else if(this._frameIndex === RIGHT || this._nobIndex === RIGHT_TOP || this._nobIndex === RIGHT || this._nobIndex === RIGHT_BOTTOM){
			this._moverCurrent.w = start.w + dx;
		}
		if(this._frameIndex === TOP || this._nobIndex === LEFT_TOP || this._nobIndex === TOP || this._nobIndex === RIGHT_TOP){
			this._moverCurrent.t = start.t + dy;
			this._moverCurrent.h = start.h - dy;
		}else if(this._frameIndex === BOTTOM || this._nobIndex === LEFT_BOTTOM || this._nobIndex === BOTTOM || this._nobIndex === RIGHT_BOTTOM){
			this._moverCurrent.h = start.h + dy;
		}
		
		// Compute constrained width and height (in case shift key is held down)
		var constrainedWidth = this._moverCurrent.w;
		var constrainedHeight = this._moverCurrent.h;
		var constraintSet = false;
		if(this._selectedWidget && this._selectedWidget.domNode.nodeName === 'IMG'){
		    var domNode = this._selectedWidget.domNode;
		    //FIXME: Add natural width/height feature for clip art widgets
		    var naturalWidth = domNode.naturalWidth;
		    var naturalHeight = domNode.naturalHeight;
		    if(typeof naturalHeight == 'number' && naturalHeight > 0 && typeof naturalWidth == 'number' && naturalWidth > 0){
		        var aspectRatio = naturalWidth / naturalHeight;
		        if(constrainedWidth < aspectRatio * constrainedHeight){
		        	constrainedWidth = constrainedHeight * aspectRatio;
		        }else{
		        	constrainedHeight = constrainedWidth / aspectRatio;
		        }
		        constraintSet = true;
		    }
		}
		if(!constraintSet){
			if(this._frameIndex === LEFT || this._nobIndex === LEFT || this._frameIndex === RIGHT || this._nobIndex === RIGHT){
				constrainedHeight = constrainedWidth;
			}else if(this._frameIndex === TOP || this._nobIndex === TOP || this._frameIndex === BOTTOM || this._nobIndex === BOTTOM){
				constrainedWidth = constrainedHeight;
			}else{	// dragging corner - use max
				if(constrainedWidth > constrainedHeight){
					constrainedHeight = constrainedWidth;
				}else{
					constrainedWidth = constrainedHeight;
				}
			}
		}
		// Set this._moverCurrentConstrained to hold selection bounds if shift key is help down
		this._moverCurrentConstrained = { l:this._moverCurrent.l, t:this._moverCurrent.t, w:constrainedWidth, h:constrainedHeight };
		if(this._frameIndex === LEFT || this._nobIndex === LEFT || this._frameIndex === RIGHT || this._nobIndex === RIGHT){
			this._moverCurrentConstrained.t -= (this._moverCurrentConstrained.h - this._moverCurrent.h)/2;
		}
		if(this._frameIndex === TOP || this._nobIndex === TOP || this._frameIndex === BOTTOM || this._nobIndex === BOTTOM){
			this._moverCurrentConstrained.l -= (this._moverCurrentConstrained.w - this._moverCurrent.w)/2;
		}

		this._updateFocusChrome(
				this._shiftKey ? this._moverCurrentConstrained : this._moverCurrent, 
				false /*offScreenAdjust*/
		);

	},
	
	onFirstMove: function(mover){
	},
	
	//Required for Moveable interface 
	onMoveStart: function(mover){
	},
	
	_moverDoneCleanup: function(){
		var context = this._context;
		var cp = context._chooseParent;
		this._lastEventTarget = null;
		this._removeKeyHandlers();
		context.dragMoveCleanup();
		cp.parentListDivDelete();
		this._mover = undefined;
		this._nobIndex = -1;
		this._frameIndex = -1;
	},
	
	onMoveStop: function(mover){
		if(this._moverDragDiv){
			var parentNode = this._moverDragDiv.parentNode;
			if(parentNode){
				parentNode.removeChild(this._moverDragDiv);
			}
			this._moverDragDiv = null;
			this.onExtentChange(this, this._shiftKey ? this._moverCurrentConstrained : this._moverCurrent);
		}
		this._moverDoneCleanup();
	},

	onMouseUp: function(event){
		this._moverDoneCleanup();
	},

    onDblClick: function(event) {
        this.showInline(this._selectedWidget);
        event.stopPropagation();
    },

	onKeyDown: function(event){
		if(event){
			dojo.stopEvent(event);
			if(event.keyCode == 16){
				this._shiftKey = true;
				this._updateFocusChrome(
						this._shiftKey ? this._moverCurrentConstrained : this._moverCurrent, 
						false /*offScreenAdjust*/
				);
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
				this._updateFocusChrome(
						this._shiftKey ? this._moverCurrentConstrained : this._moverCurrent, 
						false /*offScreenAdjust*/
				);
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

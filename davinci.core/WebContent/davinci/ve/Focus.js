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
	RIGHT_BOTTOM = 7;

dojo.declare("davinci.ve.Focus", dijit._Widget, {

	size: 6,

	postCreate: function(){
		if(this.size < 2){
			this.size = 2;
		}

		dojo.style(this.domNode, {position: "absolute", zIndex: 1000, display: "none"}); // FIXME: move to CSS

		this._frames = [];
		for(var i = 0; i < 4; i++){
			var style = {position: "absolute", opacity: 0.5, overflow: "hidden", cursor: "move"};
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
		for(var i = 0; i < 8; i++){
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
		
		this._nobs[LEFT].style.left =
			this._nobs[TOP].style.top =
			this._nobs[LEFT_TOP].style.left =
			this._nobs[LEFT_TOP].style.top =
			this._nobs[LEFT_BOTTOM].style.left =
			this._nobs[RIGHT_TOP].style.top = -this.size + "px";
		this._nobIndex = -1;

		this._box = {l: 0, t: 0, w: 0, h: 0};

		this._resizable = {width: true, height: true};
	},
	

	move: function(box){
		if(!box){
			return;
		}

		var b = this._box;
		b.l = box.l;
		b.t = box.t;

		dojo.style(this.domNode, {left: b.l + "px", top: b.t + "px"});
		var snapBox = {l:b.l, t:b.t, w:0, h:0};
		if(this._box && this._box.w && this._box.h){
			snapBox.w = this._box.w;
			snapBox.h = this._box.h;
		}
		davinci.ve.Snap.updateSnapLines(this._context, snapBox);
		if(this._contexDiv){
			var x = b.w + 10;
			this._contexDiv.style.left = x + 'px';
			this._updateSubwidgetList();
		}
	},

	resize: function(box, widget){
		if(!box){
			return;
		}

		var b = dojo.mixin(this._box, box);

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

		// When a single widget at the top-level is 100%x100%, right/bottom edge must stay on screen
		if(widget && widget.getParent().type == "html.body"){
			var container = this._context.getContainerNode();
			if(widget.domNode.style.height == "100%"){
				b.h = container.scrollHeight - this.size * 2;
			}
	
			if(widget.domNode.style.width == "100%"){
				b.w = container.scrollWidth - this.size * 2;
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
		// not to start Mover on the context menu
		if(event.button === 2 || event.ctrlKey){
			return;
		}

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
			}
		}
	},

	onMouseUp: function(event){
		if(this._updateTarget){
			clearTimeout(this._updateTarget);
			delete this._updateTarget;
		}
		if(this._mover){
			this._mover = undefined;
			switch(this._nobIndex){
			case -1: // frame
				this.onExtentChange(this, dojo.mixin({l: this._box.l, t: this._box.t}, this._client));
				break;
			case RIGHT:
			case BOTTOM:
			case RIGHT_BOTTOM:
				this.onExtentChange(this, {w: this._box.w, h: this._box.h});
				break;
			default:
				this.onExtentChange(this, dojo.mixin(this._box, this._client));
			}
		}
		this._nobIndex = -1;
		this._nobBox = null;
		davinci.ve.Snap.clearSnapLines(this._context);
	},
	
	onDblClick: function(event) {
		this.showInline(this._selectedWidget);
		event.stopPropagation();
	},

	onMove: function(mover, box, event){
		if(this._nobIndex < 0){ // frame
			this.move(box);
			this._client = {x: event.clientX, y: event.clientY};
			if(!this._updateTarget){
				this._updateTarget = setTimeout(dojo.hitch(this, function(){
					this.onExtentChange(this, this._client, true);
					delete this._updateTarget;
				}), 200);
			}
		}else{
			var b = {l: this._box.l, t: this._box.t, w: this._box.w, h: this._box.h};
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
			this.resize(b);
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
		var span = this._contexDiv.firstElementChild;
		var pMenu;
		var menuId = this._context._themeName + '_subwidgetmenu';
		pMenu = dijit.byId(menuId);
		if (pMenu) {
			pMenu.destroyRecursive(false);
		}
		// get the version of dijit that the theme editor html template is using.
		// if we don't when we create the subwidget menu dojo/resources/blank.gif can't be found 
		// and we have no check boxes on FF
		var localDijit = this._context.getDijit();
        //pMenu = new dijit.Menu({ id:menuId  },span);
        pMenu = new localDijit.Menu({ id:menuId  },span);

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
			if (!widget.subwidget)
				checked = true; // no subwidget selected
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
				if (widget.subwidget === s)
					checked = true; 
				else
					checked = false;
				var menuItem = new localDijit.CheckedMenuItem({
	                label: s,
	                id: this._context._themeName + '_' + s,
	                checked: checked,
	                onClick: dojo.hitch(this, "_subwidgetSelected")
            	})
				pMenu.addChild(menuItem);
				if (checked)
					this._currentItem = menuItem;
			}
		}

        pMenu.startup();
        this._cm = pMenu;
        this._updateSubwidgetListForState();
        dojo.subscribe("/davinci/ui/subwidgetSelectionChanged",dojo.hitch(this,this._subwidgetSelectedChange));
        dojo.subscribe("/davinci/states/state/changed", dojo.hitch(this, this._updateSubwidgetListForState));
	},
	stopPropagation: function(e){
		
		//console.log('Focus:stopPropagation');
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
		if (this._displayedWidget === this._context._selectedWidget) {
			var editor = davinci.Runtime.currentEditor;
			var themeMetadata = editor._theme;
			var items = this._cm.getChildren();
			for (var i=0; i<items.length; i++){
				for (var i=0; i<items.length; i++){ 
					var subwidget = items[i].label;
					if (subwidget === 'WidgetOuterContainer'){
						subwidget = null;
					}
					items[i].setDisabled(!themeMetadata.isStateValid(this._displayedWidget, editor._currentState, subwidget));
				}
			}

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
			dojo.unsubscribe("/davinci/ui/subwidgetSelectionChanged");
			dojo.unsubscribe("/davinci/states/state/changed");
		}
		this._currentItem = null;
	}
});

})();
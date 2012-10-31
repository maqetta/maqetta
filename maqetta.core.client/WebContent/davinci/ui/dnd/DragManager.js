define(["dojo/_base/declare"
        

],function(declare){
	
	return new declare("",null, {
		disabled: false, // disable all D&D operations
		currentDragSource: null,
		currentDropTarget: null,
		dropAcceptable: false,
		dropTargets: null,
		dragTriggered: false,
		currentDomElement: null,
		_connectors: null,
		_moveConnector: null,
		document: null,
		documentX: 0,
		documentY: 0,

		_ABSOLUTE_THRESHOLD: 3,
		_STATIC_THRESHOLD: 40,

		constructor: function(){
			this.dropTargets = [];
			this._connectors = [
				dojo.connect(dojo.doc, "onkeydown", this, "onKeyDown"),
				dojo.connect(dojo.doc, "onmouseover", this, "onMouseOver"),
				dojo.connect(dojo.doc, "onmouseout", this, "onMouseOut"),
				dojo.connect(dojo.doc, "onmousedown", this, "onMouseDown"),
				dojo.connect(dojo.doc, "onmouseup", this, "onMouseUp")
			];
		},

		destroy: function(){
			dojo.forEach(this._connectors, dojo.disconnect);
		},

		onKeyDown: function(e){
			if(e.keyCode == 27){ // ESC
				if(this.currentDragSource){
					this.dropAcceptable = false;
					this.onMouseUp(e);
				}
			}
		},

		onMouseDown: function(e, dragSource){
			if(this.disabled){ return; }
			if(this.dragTriggered){ return; }
			if(!dojo.mouseButtons.isLeft(e) || e.metaKey || e.ctrlKey){ return; } // ignore right-click, mod keys
			if(dojo.isIE){
				e.pageX -= 2;
				e.pageY -= 2;
			}
			if(this.dragTriggered){ return; } // still dragging  FIXME: can't be valid to do this twice?
			var ds = this.currentDragSource = dragSource || this.findDragSource(e);
			if(!ds){ return; }
			ds.onDragDown(e);
			for(var i = 0, len = this.dropTargets.length; i < len; i++){
				var dt = this.dropTargets[i];
				if(!dt.disabled){
					dt.onDragDown(e);
				}
			}

			e.preventDefault();
			this._moveConnectors = [dojo.connect(dojo.doc, "onmousemove", this, "onMouseMove")];
			if(this.document && this.document != dojo.doc){
				this._moveConnectors.push(dojo.connect(this.document, "onmousemove", this, "onMouseMove"));
				this._moveConnectors.push(dojo.connect(this.document, "onmouseover", this, "onMouseOver"));
				this._moveConnectors.push(dojo.connect(this.document, "onmouseout", this, "onMouseOut"));
				this._moveConnectors.push(dojo.connect(this.document, "onmouseup", this, "onMouseUp"));
			}
		},

		onMouseMove: function(e){
			e.preventDefault(); // this disables selection
			if(dojo.isIE){
				e.pageX -= 2;
				e.pageY -= 2;
			}
			if(e.target == this.document || e.target.ownerDocument == this.document){
				e.documentX = this.documentX;
				e.documentY = this.documentY;
			}
			var ds = e.dragSource = this.currentDragSource;
			if(!this.dragTriggered){
				var dx = e.pageX - ds.pageX;
				var dy = e.pageY - ds.pageY;
				var d = Math.sqrt(dx*dx + dy*dy);
				if(ds.positioning == "absolute"){
					if(d < this._ABSOLUTE_THRESHOLD){ return; }
				}else{
					if(d < this._STATIC_THRESHOLD){ return; }
				}

				this.dragTriggered = true;

				ds.onDragStart(e);
				for(var i = 0, len = this.dropTargets.length; i < len; i++){
					var dt = this.dropTargets[i];
					if(!dt.disabled){
						e.dropTarget = dt;
						dt.onDragStart(e);
					}
				}

				// we need a mouseover event here to setup drop target
				this.onMouseOver(e);
			}


			ds.onDragMove(e);

			var dt = this.currentDropTarget;
			if(dt){
				if(this.dropAcceptable){
					e.dropTarget = dt;
					dt.onDragMove(e, this.dragObjects);
				}
			}
			else{
				this.dropAcceptable = false;
			}
		},

		onMouseOver: function(e){
			this.currentDomElement = e.target;

			if(!this.dragTriggered){ return; }

			// find acceptable drop target
			var ds = this.currentDragSource;
			if(!ds){ return; }
			e.dragSource = ds;
			var dt = this.findDropTarget(this.currentDomElement, ds);
			if(dt && ds.domNode == dt.domNode){ return; } // source and target are the same
			if(dt != this.currentDropTarget){
				if(this.currentDropTarget){
					e.dropTarget = this.currentDropTarget;
					this.currentDropTarget.onDragOut(e);
				}
				if(dt){
					e.dropTarget = dt;
					this.dropAcceptable = dt.onDragOver(e);
				}
			}
			this.currentDropTarget = dt;

			/*
			// switch the positioning mode
			if(dt && ds && dt.nodeUnderMouse == ds.domNode){
				if(ds.positioning == "absolute"){
					ds.positioning = "static";
				}else{
					ds.positioning = "absolute";
				}
			}
			*/
		},

		onMouseOut: function(e){
		},

		onMouseUp: function(e){
			if(this.ignoreMouseUp){ return; }
			dojo.forEach(this._moveConnectors, dojo.disconnect);
			if(!this.dragTriggered){ // we are not dragging
				this._resetStatus();
				return;
			}

			for(var i = 0, len = this.dropTargets.length; i < len; i++){
				var _dt = this.dropTargets[i];
				if(!_dt.disabled){
					e.dropTarget = _dt;
					_dt.onDragEnd(e);
				}
			}

			var ds = this.currentDragSource;
			var dt = this.currentDropTarget;
			e.dragSource = ds;
			e.dropTarget = dt;

			if(!ds){
				this._resetStatus();
				return;
			}

			if(dt){
				dt.onDropStart(e);
				if(this.dropAcceptable){
					var ret = dt.onDrop(e);
					dt.onDragOut(e);
					if(ret != undefined && !e.dragStatus){
						e.dragStatus = ret ? "dropSuccess" : "dropFailure";
					}
				}else{
					dt.onDragOut(e);
					e.dragStatus = "dropFailure";
				}
			}
			else{
				e.dragStatus = "dropFailure";
			}

			ds.onDragEnd(e);
			if(dt){
				dt.onDropEnd(e);
			}
			this._resetStatus();
		},

		_resetStatus: function(){
			this.currentDropTarget = null;
			this.currentDragSource = null;
			this.dropAcceptable = false;
			this.dragTriggered = false;
			this.currentDomElement = null;
		},

		findDragSource: function(e){
			for(var node = e.target; node && node != dojo.doc.body; node = node.parentNode){
				if(node.dragSource && !node.dragSource.disabled){
					return node.dragSource;
				}
			}
			return null;
		},

		findDropTarget: function(domElement, ds){
			var dt = null;
			for(var elem = domElement, prev = null; elem != null && elem != dojo.doc.body; elem = elem.parentNode){
				var _dt = elem.dropTarget;
				if(_dt && !_dt.disabled && _dt.accepts(ds)){
					dt = _dt;
					dt.nodeUnderMouse = prev; // direct child of the drop target
					break;
				}
				if(elem.dragSource && !elem.dragSource.disabled){
					prev = elem;
				}
			}
			return dt;
		},

		registerDropTarget: function(dt){
			this.dropTargets.push(dt);
		},

		unregisterDropTarget: function(dt){
			for(var i = 0, len = this.dropTargets.length; i < len; i++){
				if(this.dropTargets[i] == dt){
					this.dropTargets.splice(i, 1);
					break;
				}
			}
		}
	})();
	
});


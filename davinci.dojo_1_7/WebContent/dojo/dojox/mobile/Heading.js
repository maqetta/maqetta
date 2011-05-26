define(["dojo/_base/html", "dojo/_base/array", "dojo/_base/lang", "./common","dijit/_WidgetBase","dijit/_Container","dijit/_Contained"],function(dhtml,darray,dlang, mcommon,WidgetBase,Container,Contained){
	// module:
	//		dojox/mobile/Heading
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.Heading", [dijit._WidgetBase,dijit._Container,dijit._Contained],{
		back: "",
		href: "",
		moveTo: "",
		transition: "slide",
		label: "",
		iconBase: "",
		backProp: {className: "mblArrowButton"},
		tag: "H1",

		buildRendering: function(){
			this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement(this.tag);
			this.domNode.className = "mblHeading";
			if(!this.label){
				dojo.forEach(this.domNode.childNodes, function(n){
					if(n.nodeType == 3){
						var v = dojo.trim(n.nodeValue);
						if(v){
							this.label = v;
							this.labelNode = dojo.create("SPAN", {innerHTML:v}, n, "replace");
						}
					}
				}, this);
			}
			if(!this.labelNode){
				this.labelNode = dojo.create("SPAN", null, this.domNode);
			}
			this.labelNode.className = "mblHeadingSpanTitle";
			this.labelDivNode = dojo.create("DIV", {
				className: "mblHeadingDivTitle",
				innerHTML: this.labelNode.innerHTML
			}, this.domNode);
		},

		startup: function(){
			if(this._started){ return; }
			var parent = this.getParent && this.getParent();
			if(!parent || !parent.resize){ // top level widget
				var _this = this;
				setTimeout(function(){ // necessary to render correctly
					_this.resize();
				}, 0);
			}
			this.inherited(arguments);
		},
	
		resize: function(){
			if(this._btn){
				this._btn.style.width = this._body.offsetWidth + this._head.offsetWidth + "px";
			}
			if(this.labelNode){
				// find the rightmost left button (B), and leftmost right button (C)
				// +-----------------------------+
				// | |A| |B|             |C| |D| |
				// +-----------------------------+
				var leftBtn, rightBtn;
				var children = this.containerNode.childNodes;
				for(i = children.length - 1; i >= 0; i--){
					var c = children[i];
					if(c.nodeType === 1){
						if(!rightBtn && dojo.hasClass(c, "mblToolbarButton") && dojo.style(c, "float") === "right"){
							rightBtn = c;
						}
						if(!leftBtn && (dojo.hasClass(c, "mblToolbarButton") && dojo.style(c, "float") === "left" || c === this._btn)){
							leftBtn = c;
						}
					}
				}

				var bw = this.domNode.offsetWidth; // bar width
				var rw = rightBtn ? bw - rightBtn.offsetLeft + 5 : 0; // rightBtn width
				var lw = leftBtn ? leftBtn.offsetLeft + leftBtn.offsetWidth + 5 : 0; // leftBtn width
				var tw = this.labelNodeLen || 0; // title width
				dojo[bw - Math.max(rw,lw)*2 > tw ? "addClass" : "removeClass"](this.domNode, "mblHeadingCenterTitle");
			}
			dojo.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		_setBackAttr: function(/*String*/back){
			if(!this._btn){
				var btn = dojo.create("DIV", this.backProp, this.domNode, "first");
				var head = dojo.create("DIV", {className:"mblArrowButtonHead"}, btn);
				var body = dojo.create("DIV", {className:"mblArrowButtonBody mblArrowButtonText"}, btn);

				this._body = body;
				this._head = head;
				this._btn = btn;
				this.backBtnNode = btn;
				this.connect(body, "onclick", "onClick");
				var neck = dojo.create("DIV", {className:"mblArrowButtonNeck"}, btn);
			}
			this.back = back;
			this._body.innerHTML = this._cv(this.back);
			this.resize();
		},
	
		_setLabelAttr: function(/*String*/label){
			this.label = label;
			this.labelNode.innerHTML = this.labelDivNode.innerHTML = this._cv(label);
			this.labelNode.style.display = "inline";
			this.labelNodeLen = this.labelNode.offsetWidth;
			this.labelNode.style.display = "";
		},
	
		findCurrentView: function(){
			var w = this;
			while(true){
				w = w.getParent();
				if(!w){ return null; }
				if(w instanceof dojox.mobile.View){ break; }
			}
			return w;
		},

		onClick: function(e){
			var h1 = this.domNode;
			dojo.addClass(h1, "mblArrowButtonSelected");
			setTimeout(function(){
				dojo.removeClass(h1, "mblArrowButtonSelected");
			}, 1000);

			if (this.back && !this.moveTo && !this.href && history){
				history.back();	
				return;
			}	
	
			// keep the clicked position for transition animations
			var view = this.findCurrentView();
			if(view){
				view.clickedPosX = e.clientX;
				view.clickedPosY = e.clientY;
			}
			this.goTo(this.moveTo, this.href);
		},
	
		goTo: function(moveTo, href){
			var view = this.findCurrentView();
			if(!view){ return; }
			if(href){
				view.performTransition(null, -1, this.transition, this, function(){location.href = href;});
			}else{
				if(dojox.mobile.app && dojox.mobile.app.STAGE_CONTROLLER_ACTIVE){
					// If in a full mobile app, then use its mechanisms to move back a scene
					dojo.publish("/dojox/mobile/app/goback");
				}else{
					// Basically transition should be performed between two
					// siblings that share the same parent.
					// However, when views are nested and transition occurs from
					// an inner view, search for an ancestor view that is a sibling
					// of the target view, and use it as a source view.
					var node = dijit.byId(view.convertToId(moveTo));
					if(node){
						var parent = node.getParent();
						while(view){
							var myParent = view.getParent();
							if (parent === myParent){
								break;
							}
							view = myParent;
						}
					}
					if(view){
						view.performTransition(moveTo, -1, this.transition);
					}
				}
			}
		}
	});
});

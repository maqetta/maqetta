define(["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/html", "./_ItemBase", "./TransitionEvent"],
	function(dojo, declare, darray, dhtml, ItemBase, TransitionEvent){
	// module:
	//		dojox/mobile/ListItem
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.ListItem", dojox.mobile._ItemBase, {
		//icon: "", // inherit from _ItemBase
		//label: "", // inherit from _ItemBase
		rightText: "",
		rightIcon2: "",
		rightIcon: "",

		anchorLabel: false,
		noArrow: false,
		selected: false,
		checked: false,
		arrowClass: "mblDomButtonArrow",
		checkClass: "mblDomButtonCheck",
		variableHeight: false,

		rightIconTitle: "",
		rightIcon2Title: "",

		// for backward compatibility
		btnClass: "",
		btnClass2: "",
	
		postMixInProperties: function(){
			// for backward compatibility
			if(this.btnClass){
				this.rightIcon = this.btnClass;
			}
			this._setBtnClassAttr = this._setRightIconAttr;
			this._setBtnClass2Attr = this._setRightIcon2Attr;
		},

		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.className = "mblListItem" + (this.selected ? " mblItemSelected" : "");

			// label
			var box = this.box = dojo.create("DIV");
			box.className = "mblListItemTextBox";
			if(this.anchorLabel){
				box.style.cursor = "pointer";
			}
			var r = this.srcNodeRef;
			if(r && !this.label){
				this.label = "";
				for(var i = 0, len = r.childNodes.length; i < len; i++){
					var n = r.firstChild;
					if(n.nodeType === 3 && dojo.trim(n.nodeValue) !== ""){
						n.nodeValue = this._cv(n.nodeValue);
						this.labelNode = dojo.create("SPAN", {className:"mblListItemLabel"});
						this.labelNode.appendChild(n);
						n = this.labelNode;
					}
					box.appendChild(n);
				}
			}
			if(!this.labelNode){
				this.labelNode = dojo.create("SPAN", {className:"mblListItemLabel"}, box);
			}
			if(this.anchorLabel){
				box.style.display = "inline"; // to narrow the text region
			}

			var a = this.anchorNode = dojo.create("A");
			a.className = "mblListItemAnchor";
			this.domNode.appendChild(a);
			a.appendChild(box);

			// right text
			this.rightTextNode = dojo.create("DIV", {className:"mblListItemRightText"}, a, "first");

			// right icon2
			this.rightIcon2Node = dojo.create("DIV", {className:"mblListItemRightIcon2"}, a, "first");

			// right icon
			this.rightIconNode = dojo.create("DIV", {className:"mblListItemRightIcon"}, a, "first");

			// icon
			this.iconNode = dojo.create("DIV", {className:"mblListItemIcon"}, a, "first");
		},

		startup: function(){
			if(this._started){ return; }
			this.inheritParams();
			var parent = this.getParent();
			if(this.moveTo || this.href || this.url || this.clickable){
				this.connect(this.anchorNode, "onclick", "onClick");
			}
			this.setArrow();
			if(parent && parent.select){
				this.connect(this.anchorNode, "onclick", "onClick");
			}

			if(dojo.hasClass(this.domNode, "mblVariableHeight")){
				this.variableHeight = true;
			}
			if(this.variableHeight){
				dojo.addClass(this.domNode, "mblVariableHeight");
				dojo.subscribe("/dojox/mobile/resizeAll", this, "layoutVariableHeight");
				setTimeout(dojo.hitch(this, "layoutVariableHeight"));
			}

			this.set("icon", this.icon);
			this.inherited(arguments);
		},

		onClick: function(e){
			var a = e.currentTarget;
			var li = a.parentNode;
			if(dojo.hasClass(li, "mblItemSelected")){ return; } // already selected
			if(this.anchorLabel){
				for(var p = e.target; p.tagName !== "LI"; p = p.parentNode){
					if(p.className == "mblListItemTextBox"){
						dojo.addClass(p, "mblListItemTextBoxSelected");
						setTimeout(function(){
							dojo.removeClass(p, "mblListItemTextBoxSelected");
						}, 1000);
						this.onAnchorLabelClicked(e);
						return;
					}
				}
			}
			var parent = this.getParent();
			if(parent.select){
				if(parent.select === "single"){
					if(!this.checked){
						this.set("checked", true);
					}
				}else if(parent.select === "multiple"){
					this.set("checked", !this.checked);
				}
			}
			this.select();

			var transOpts;
			if (this.moveTo || this.href || this.url || this.scene){
				transOpts = {moveTo: this.moveTo, href: this.href, url: this.url, scene: this.scene, transition: this.transition, transitionDir: this.transitionDir};
			}else if (this.transitionOptions){
				transOpts = this.transitionOptions;
			}	

			if (transOpts){
				this.setTransitionPos(e);
				return new TransitionEvent(this.domNode,transOpts,e).dispatch();
			}
		},
	
		deselect: function(){
			dojo.removeClass(this.domNode, "mblItemSelected");
		},
	
		select: function(){
			var parent = this.getParent();
			if(parent.stateful){
				parent.deselectAll();
			}else{
				var _this = this;
				setTimeout(function(){
					_this.deselect();
				}, 1000);
			}
			dojo.addClass(this.domNode, "mblItemSelected");
		},
	
		onAnchorLabelClicked: function(e){
			// Stub function to connect to from your application.
		},

		layoutVariableHeight: function(e){
			var h = this.anchorNode.offsetHeight;
			dojo.forEach([
					this.rightTextNode,
					this.rightIcon2Node,
					this.rightIconNode,
					this.iconNode
				], function(n){
					var t = Math.round((h - n.offsetHeight) / 2);
					n.style.marginTop = t + "px";
				});
		},

		setArrow: function(){
			if(this.checked){ return; }
			var c = "";
			var parent = this.getParent();
			if(this.moveTo || this.href || this.url || this.clickable){
				if(!this.noArrow && !(parent && parent.stateful)){
					c = this.arrowClass;
				}
			}
			if(c){
				this._setRightIconAttr(c);
			}
		},

		_setIconAttr: function(icon){
			if(!this.getParent()){ return; } // icon may be invalid because inheritParams is not called yet
			this.icon = icon;
			var a = this.anchorNode;
			dojo.empty(this.iconNode);
			if(icon && icon !== "none"){
				dojox.mobile.createIcon(icon, this.iconPos, null, this.alt, this.iconNode);
				if(this.iconPos){
					dojo.addClass(this.iconNode.firstChild, "mblListItemSpriteIcon");
				}
				dojo.removeClass(a, "mblListItemAnchorNoIcon");
			}else{
				dojo.addClass(a, "mblListItemAnchorNoIcon");
			}
		},
	
		_setCheckedAttr: function(/*Boolean*/checked){
			var parent = this.getParent();
			if(parent.select === "single" && checked){
				dojo.forEach(parent.getChildren(), function(child){
					child.set("checked", false);
				});
			}
			this._setRightIconAttr(this.checkClass);
			this.rightIconNode.style.display = checked ? "" : "none";
			dojo.toggleClass(this.domNode, "mblListItemChecked", checked);
			if(this.checked !== checked){
				this.getParent().onCheckStateChanged(this, checked);
			}
			this.checked = checked;
		},
	
		_setRightTextAttr: function(/*String*/text){
			this.rightText = text;
			this.rightTextNode.innerHTML = this._cv(text);
		},
	
		_setRightIconAttr: function(/*String*/icon){
			this.rightIcon = icon;
			dojo.empty(this.rightIconNode);
			dojox.mobile.createIcon(icon, null, null, this.rightIconTitle, this.rightIconNode);
		},
	
		_setRightIcon2Attr: function(/*String*/icon){
			this.rightIcon2 = icon;
			dojo.empty(this.rightIcon2Node);
			dojox.mobile.createIcon(icon, null, null, this.rightIcon2Title, this.rightIcon2Node);
		},
	
		_setLabelAttr: function(/*String*/text){
			this.label = text;
			this.labelNode.innerHTML = this._cv(text);
		}
	});
});

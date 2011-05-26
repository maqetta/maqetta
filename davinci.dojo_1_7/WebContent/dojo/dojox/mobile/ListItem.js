define(["dojo/_base/array", "dojo/_base/html", "./_ItemBase", "./TransitionEvent"], function(darray,dhtml, ItemBase, TransitionEvent){
	// module:
	//		dojox/mobile/ListItem
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.ListItem", dojox.mobile._ItemBase, {
		rightText: "",
		btnClass: "",
		btnClass2: "",
		anchorLabel: false,
		noArrow: false,
		selected: false,
		checked: false,
		rightIconClass: "",
		arrowClass: "mblDomButtonArrow",
		checkClass: "mblDomButtonCheck",
	
		buildRendering: function(){
			var a = this.anchorNode = dojo.create("A");
			a.className = "mblListItemAnchor";
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
						this.labelNode = dojo.create("SPAN");
						this.labelNode.appendChild(n);
						n = this.labelNode;
					}
					box.appendChild(n);
				}
			}
			if(this.label){
				this.labelNode = dojo.create("SPAN", null, box);
			}
			a.appendChild(box);
			if(this.anchorLabel){
				box.style.display = "inline"; // to narrow the text region
			}
			var li = this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("LI");
			li.className = "mblListItem" + (this.selected ? " mblItemSelected" : "");
			li.appendChild(a);
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

			this.set("icon", this.icon);
			this.inherited(arguments);
		},
	
		onClick: function(e){
			var a = e.currentTarget;
			var li = a.parentNode;
			if(dojo.hasClass(li, "mblItemSelected")){ return; } // already selected
			if(this.anchorLabel){
				for(var p = e.target; p.tagName != "LI"; p = p.parentNode){
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
				this._setBtnClassAttr(c);
			}
		},
	
		_setIconAttr: function(icon){
			if(!this.getParent()){ return; } // icon may be invalid because inheritParams is not called yet
			this.icon = icon;
			var a = this.anchorNode;
			if(this.icon && this.icon.indexOf("mblDomButton") === 0){
				if(!this.iconNode){
					this.iconNode = dojo.create("DIV");
					this.domNode.insertBefore(this.iconNode, a);
				}
				this.iconNode.className = this.icon + " mblLeftButton";
				dojox.mobile.createDomButton(this.iconNode);
				dojo.removeClass(a, "mblListItemAnchorNoIcon");
				a.style.paddingLeft = (this.iconNode.offsetWidth + 11) + "px";
			}else if(this.icon && this.icon != "none"){
				if(!this.iconNode){
					this.iconNode = dojo.create("IMG", {
						className: "mblListItemIcon",
						alt: this.alt
					});
					this.domNode.insertBefore(this.iconNode, a);
				}
				this.iconNode.src = this.icon;
				dojox.mobile.setupIcon(this.iconNode, this.iconPos);
				dojo.removeClass(a, "mblListItemAnchorNoIcon");
			}else{
				dojo.addClass(a, "mblListItemAnchorNoIcon");
			}
		},
	
		_setBtnClass: function(/*String*/btnClass, /*DomNode*/node, /*String*/className){
			var div;
			if(node){
				if(node.className.match(/(mblDomButton\w+)/)){
					dojo.removeClass(node, RegExp.$1);
				}
			dojo.addClass(node, btnClass);
				div = node;
			}else{
				div = dojo.create("DIV", {className:btnClass+" "+className}, this.anchorNode);
			}
			dojox.mobile.createDomButton(div);
			return div;
		},
	
		_setBtnClassAttr: function(/*String*/rightIconClass){
			this.rightIconNode = this._setBtnClass(rightIconClass, this.rightIconNode, "mblRightButton");
			this._layoutRightText();
		},
	
		_setBtnClass2Attr: function(/*String*/rightIconClass){
			this.rightIconNode2 = this._setBtnClass(rightIconClass, this.rightIconNode2, "mblRightButton mblRightButton2");
			dojo.addClass(this.box, "mblListItemTextBox2");
			this._layoutRightText();
		},
	
		_setCheckedAttr: function(/*Boolean*/checked){
			var parent = this.getParent();
			if(parent.select === "single" && checked){
				dojo.forEach(parent.getChildren(), function(child){
					child.set("checked", false);
				});
			}
			if(!this.checkNode){
				this._setBtnClassAttr(this.checkClass);
				this.checkNode = this.rightIconNode;
			}
			this.checkNode.style.display = checked ? "" : "none";
			dojo.toggleClass(this.domNode, "mblItemChecked", checked);
			if(this.checked !== checked){
				this.getParent().onCheckStateChanged(this, checked);
			}
			this.checked = checked;
			this._layoutRightText();
		},
	
		_setRightTextAttr: function(/*String*/text){
			this.rightText = text;
			if(!this._rightTextNode){
				this._rightTextNode = dojo.create("DIV", {className:"mblRightText"}, this.anchorNode);
			}
			this._rightTextNode.innerHTML = this._cv(text);
			this._layoutRightText();
		},
	
		_setLabelAttr: function(/*String*/text){
			this.label = text;
			this.labelNode.innerHTML = this._cv(text);
		},
	
		_layoutRightText: function(){
			if(this._rightTextNode){
				var w = (this.rightIconNode ? this.rightIconNode.offsetWidth : 0) +
					(this.rightIconNode2 ? this.rightIconNode2.offsetWidth : 0);
				this._rightTextNode.style.right = w + 11 + "px";
			}
		}
	});
});

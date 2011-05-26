define(["dojo/_base/array","dojo/_base/html","./common","./_ItemBase"],function(darray,dhtml, mcommon,ItemBase){
	// module:
	//		dojox/mobile/TabBar
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.TabBarButton", [dojox.mobile._ItemBase],{
		icon1: "", // unselected (dark) icon
		icon2: "", // selected (highlight) icon
		iconPos1: "", // unselected (dark) icon position
		iconPos2: "", // selected (highlight) icon position
		selected: false,
		transition: "none",
		tag: "LI",
		selectOne: true,
	
		inheritParams: function(){
			var parent = this.getParent();
			if(parent){
				if(!this.transition){ this.transition = parent.transition; }
				if(this.icon1 && parent.iconBase &&
					parent.iconBase.charAt(parent.iconBase.length - 1) === '/'){
					this.icon1 = parent.iconBase + this.icon1;
				}
				if(!this.icon1){ this.icon1 = parent.iconBase; }
				if(!this.iconPos1){ this.iconPos1 = parent.iconPos; }
				if(this.icon2 && parent.iconBase &&
					parent.iconBase.charAt(parent.iconBase.length - 1) === '/'){
					this.icon2 = parent.iconBase + this.icon2;
				}
				if(!this.icon2){ this.icon2 = parent.iconBase || this.icon1; }
				if(!this.iconPos2){ this.iconPos2 = parent.iconPos || this.iconPos1; }
			}
		},
	
		buildRendering: function(){
			var a = this.anchorNode = dojo.create("A", {className:"mblTabBarButtonAnchor"});
			this.connect(a, "onclick", "onClick");
	
			var div = dojo.create("DIV", {className:"mblTabBarButtonDiv"}, a);
			var divInner = this.innerDivNode = dojo.create("DIV", {className:"mblTabBarButtonDiv mblTabBarButtonDivInner"}, div);
	
			this.box = dojo.create("DIV", {className:"mblTabBarButtonTextBox"}, a);
			var box = this.box;
			var label = "";
			var r = this.srcNodeRef;
			if(r){
				for(var i = 0, len = r.childNodes.length; i < len; i++){
					var n = r.firstChild;
					if(n.nodeType === 3){
						label += dojo.trim(n.nodeValue);
						n.nodeValue = this._cv(n.nodeValue);
					}
					box.appendChild(n);
				}
			}
			if(this.label){
				box.appendChild(dojo.doc.createTextNode(this._cv(this.label)));
			}else{
				this.label = label;
			}
	
			this.domNode = this.srcNodeRef || dojo.create(this.tag);
			this.containerNode = this.domNode;
			this.domNode.appendChild(a);
			if(this.domNode.className.indexOf("mblDomButton") != -1){
				var domBtn = dojo.create("DIV", null, a);
				dojox.mobile.createDomButton(this.domNode, null, domBtn);
				dojo.addClass(this.domNode, "mblTabButtonDomButton");
			}
		},
	
		startup: function(){
			if(this._started){ return; }
			this.inheritParams();
			var parent = this.getParent();
	
			var _clsName = parent ? parent._clsName : "mblTabBarButton";
			dojo.addClass(this.domNode, _clsName + (this.selected ? " mblTabButtonSelected" : ""));
	
			if(parent && parent.barType == "segmentedControl"){
				// proper className may not be set when created dynamically
				dojo.removeClass(this.domNode, "mblTabBarButton");
				dojo.addClass(this.domNode, parent._clsName);
				this.box.className = "";
			}
			this.set({icon1:this.icon1, icon2:this.icon2});
			this.inherited(arguments);
		},
	
		select: function(deselect){
			if(deselect){
				this.selected = false;
				dojo.removeClass(this.domNode, "mblTabButtonSelected");
			}else{
				this.selected = true;
				dojo.addClass(this.domNode, "mblTabButtonSelected");
				for(var i = 0, c = this.domNode.parentNode.childNodes; i < c.length; i++){
					if(c[i].nodeType != 1){ continue; }
					var w = dijit.byNode(c[i]); // sibling widget
					if(w && w != this){
						w.select(true);
					}
				}
			}
			if(this.iconNode1){
				this.iconNode1.style.visibility = this.selected ? "hidden" : "";
			}
			if(this.iconNode2){
				this.iconNode2.style.visibility = this.selected ? "" : "hidden";
			}
		},
	
		onClick: function(e){
			this.defaultClickAction();
		},
	
		_setIcon: function(icon, pos, num, sel){
			var i = "icon" + num, n = "iconNode" + num, p = "iconPos" + num;
			if(icon){ this[i] = icon; }
			if(pos){
				if(this[p] === pos){ return; }
				this[p] = pos;
			}
			var div = this.innerDivNode;
			if(icon && icon.indexOf("mblDomButton") === 0){
				if(!this[n]){
					this[n] = dojo.create("DIV", null, div);
				}
				this[n].className = icon + " mblTabBarButtonIcon";
				dojox.mobile.createDomButton(this[n]);
				dojo.removeClass(div, "mblTabBarButtonNoIcon");
			}else if(icon && icon != "none"){
				if(!this[n]){
					this[n] = dojo.create("IMG", {
						className: "mblTabBarButtonIcon",
						alt: this.alt
					}, div);
				}
				this[n].src = icon;
				this[n].style.visibility = sel ? "hidden" : "";
				dojox.mobile.setupIcon(this[n], this[p]);
				this[n].onload = function(){
					// iPhone and Windows Safari sometimes fail to draw icon images.
					// For some reason, this code solves the problem.
					// Other browsers, including Chrome, do not have this problem.
					// Same issue is fixed again a few lines below inside icon2Node.onload()
					var originDisplay = this.style.display;
					this.style.display = "none";
					this.style.display = originDisplay;
				};
			}else{
				dojo.addClass(div, "mblTabBarButtonNoIcon");
			}
		},
	
		_setIcon1Attr: function(icon){
			this._setIcon(icon, null, 1, this.selected);
		},
	
		_setIcon2Attr: function(icon){
			this._setIcon(icon, null, 2, !this.selected);
		},
	
		_setIconPos1Attr: function(pos){
			this._setIcon(null, pos, 1, this.selected);
		},
	
		_setIconPos2Attr: function(pos){
			this._setIcon(null, pos, 2, !this.selected);
		}
	});
});

define(["dojo/_base/array","dojo/_base/html","./common","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./Heading","./_ItemBase","./TabBarButton"],function(darray,dhtml, mcommon,WidgetBase,Container,Contained,Heading,ItemBase){
	// module:
	//		dojox/mobile/TabBar
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.TabBar", [dijit._WidgetBase,dijit._Container,dijit._Contained],{
		iconBase: "",
		iconPos: "",
		barType: "tabBar", // "tabBar"(default) or "segmentedControl"
		inHeading: false,
		tag: "UL",

		_fixedButtonWidth: 76,
		_fixedButtonMargin: 17,
		_largeScreenWidth: 500,

		buildRendering: function(){
			this._clsName = this.barType == "segmentedControl" ? "mblTabButton" : "mblTabBarButton";
			this.domNode = this.containerNode = this.srcNodeRef || dojo.create(this.tag);
			this.domNode.className = this.barType == "segmentedControl" ? "mblTabPanelHeader" : "mblTabBar";
		},

		startup: function(){
			if(this._started){ return; }
			var _this = this;
			setTimeout(function(){ // to get proper dimension
				// resize() has to be called regardless of whether this is top-level or not
				// to ensure that TabBarButton#startup() has been called before resize().
				_this.resize();
			}, 0);
			this.inherited(arguments);
		},

		resize: function(size){
			var i,w;
			if (size && size.w){
				dojo.marginBox(this.domNode, size);
				w = size.w;
			}else{
				// Calculation of the bar width varies according to its "position" value.
				// When the widget is used as a fixed bar, its position would be "absolute".
				w = dojo.style(this.domNode, "position") === "absolute" ?
					dojo.contentBox(this.domNode).w : dojo.marginBox(this.domNode).w;
			}
			var bw = this._fixedButtonWidth;
			var bm = this._fixedButtonMargin;
	
			var children = this.containerNode.childNodes;
			var arr = [];
			for(i = 0; i < children.length; i++){
				var c = children[i];
				if(c.nodeType != 1){ continue; }
				if(dojo.hasClass(c, this._clsName)){
					arr.push(c);
				}
			}
	
			var margin;
			if(this.barType == "segmentedControl"){
				margin = w;
				var totalW = 0; // total width of all the buttons
				for(i = 0; i < arr.length; i++){
					margin -= dojo.marginBox(arr[i]).w;
					arr[i].style.marginTop = "3px";
					totalW += arr[i].offsetWidth;
				}
				margin = Math.floor(margin/2);
				var parent = this.getParent();
				var inHeading = this.inHeading || parent instanceof dojox.mobile.Heading;
				this.containerNode.style.padding = "3px 0px 0px " + (inHeading ? 0 : margin) + "px";
				if(inHeading){
					dojo.style(this.domNode, {
						background: "none",
						border: "none",
						width: totalW + 2 + "px"
					});
				}
			}else{
				margin = Math.floor((w - (bw + bm * 2) * arr.length) / 2);
				if(w < this._largeScreenWidth || margin < 0){
					// If # of buttons is 4, for example, assign "25%" to each button.
					// More precisely, 1%(left margin) + 98%(bar width) + 1%(right margin)
					for(i = 0; i < arr.length; i++){
						arr[i].style.width = Math.round(98/arr.length) + "%";
						arr[i].style.margin = "0px";
					}
					this.containerNode.style.padding = "0px 0px 0px 1%";
				}else{
					// Fixed width buttons. Mainly for larger screen such as iPad.
					for(i = 0; i < arr.length; i++){
						arr[i].style.width = bw + "px";
						arr[i].style.margin = "0 " + bm + "px";
					}
					this.containerNode.style.padding = "0px 0px 0px " + margin + "px";
				}
			}
			if(!dojo.some(this.getChildren(), function(child){ return child.iconNode1; })){
				dojo.addClass(this.domNode, "mblTabBarNoIcons");
			}
			if(!dojo.some(this.getChildren(), function(child){ return child.label; })){
				dojo.addClass(this.domNode, "mblTabBarNoText");
			}
		}
	});

});

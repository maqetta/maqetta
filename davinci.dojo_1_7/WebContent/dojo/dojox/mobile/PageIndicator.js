define(["dojo/_base/html", "dojo/_base/array", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_Contained"],function(dhtml,darray,dlang,WidgetBase,Contained){
	// module:
	//		dojox/mobile/Heading
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.PageIndicator", [dijit._WidgetBase, dijit._Contained],{
		refId: "",

		buildRendering: function(){
			this.domNode = this.srcNodeRef || dojo.doc.createElement("DIV");
			this.domNode.className = "mblPageIndicator";
			this._tblNode = dojo.create("TABLE", {className:"mblPageIndicatorContainer"}, this.domNode);
			this._tblNode.insertRow(-1);
			this.connect(this.domNode, "onclick", "onClick");
			dojo.subscribe("/dojox/mobile/viewChanged", this, function(view){
				this.reset();
			});
		},

		startup: function(){
			var _this = this;
			setTimeout(function(){ // to wait until views' visibility is determined
				_this.reset();
			}, 0);
		},

		reset: function(){
			var r = this._tblNode.rows[0];
			var i, c, a = [], dot;
			var refNode = (this.refId && dojo.byId(this.refId)) || this.domNode;
			var children = refNode.parentNode.childNodes;
			for(i = 0; i < children.length; i++){
				c = children[i];
				if(this.isView(c)){
					a.push(c);
				}
			}
			if(r.cells.length !== a.length){
				dojo.empty(r);
				for(i = 0; i < a.length; i++){
					c = a[i];
					dot = dojo.create("DIV", {className:"mblPageIndicatorDot"});
					r.insertCell(-1).appendChild(dot);
				}
			}
			if(a.length === 0){ return; }
			var currentView = dijit.byNode(a[0]).getShowingView();
			for(i = 0; i < r.cells.length; i++){
				dot = r.cells[i].firstChild;
				if(a[i] === currentView.domNode){
					dojo.addClass(dot, "mblPageIndicatorDotSelected");
				}else{
					dojo.removeClass(dot, "mblPageIndicatorDotSelected");
				}
			}
		},

		isView: function(node){
			return (node && node.nodeType === 1 && dojo.hasClass(node, "mblView"));
		},

		onClick: function(e){
			if(e.target !== this.domNode){ return; }
			if(e.layerX < this._tblNode.offsetLeft){
				dojo.publish("/dojox/mobile/prevPage", [this]);
			}else if(e.layerX > this._tblNode.offsetLeft + this._tblNode.offsetWidth){
				dojo.publish("/dojox/mobile/nextPage", [this]);
			}
		}
	});
});

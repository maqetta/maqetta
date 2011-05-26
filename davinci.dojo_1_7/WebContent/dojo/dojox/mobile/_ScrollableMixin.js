define(["dojo/_base/lang","./common","dijit/_WidgetBase","./scrollable"], function(dlang, mcommon,WidgetBase,Scrollable){
	// module:
	//		dojox/mobile/_ScrollableMixin
	// summary:
	//		Mixin for widgets to have a touch scrolling capability.
	// description:
	//		Actual implementation is in scrollable.js.
	//		scrollable.js is not a dojo class, but just a collection
	//		of functions. This module makes scrollable.js a dojo class.

	dojo.declare("dojox.mobile._ScrollableMixin", null, {
		fixedHeader: "",
		fixedFooter: "",
		scrollableParams: {},

		destroy: function(){
			this.cleanup();
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){ return; }
			var node;
			var params = this.scrollableParams;
			if(this.fixedHeader){
				node = dojo.byId(this.fixedHeader);
				if(node.parentNode == this.domNode){ // local footer
					this.isLocalHeader = true;
				}
				params.fixedHeaderHeight = node.offsetHeight;
			}
			if(this.fixedFooter){
				node = dojo.byId(this.fixedFooter);
				if(node.parentNode == this.domNode){ // local footer
					this.isLocalFooter = true;
					node.style.bottom = "0px";
				}
				params.fixedFooterHeight = node.offsetHeight;
			}
			this.init(params);
			for(var p = this.getParent(); p; p = p.getParent()){
				if(p && p.scrollableParams){
					this.isNested = true;
					this.dirLock = true;
					p.dirLock = true;
					break;
				}
			}
			this.inherited(arguments);
		},

		findAppBars: function(){
			// search for application-specific header or footer
			var i, len, c;
			for(i = 0, len = dojo.body().childNodes.length; i < len; i++){
				c = dojo.body().childNodes[i];
				this.checkFixedBar(c, false);
			}
			if(this.domNode.parentNode){
				for(i = 0, len = this.domNode.parentNode.childNodes.length; i < len; i++){
					c = this.domNode.parentNode.childNodes[i];
					this.checkFixedBar(c, false);
				}
			}
			this.fixedFooterHeight = this.fixedFooter ? this.fixedFooter.offsetHeight : 0;
		},

		checkFixedBar: function(/*DomNode*/node, /*Boolean*/local){
			if(node.nodeType === 1){
				var fixed = node.getAttribute("fixed")
					|| (dijit.byNode(node) && dijit.byNode(node).fixed);
				if(fixed === "top"){
					dojo.addClass(node, "mblFixedHeaderBar");
					if(local){
						node.style.top = "0px";
						this.fixedHeader = node;
					}
					return fixed;
				}else if(fixed === "bottom"){
					dojo.addClass(node, "mblFixedBottomBar");
					this.fixedFooter = node;
					return fixed;
				}
			}
			return null;
		}
	});
	dojo.extend(dojox.mobile._ScrollableMixin, new Scrollable(dojo, dojox));
	return dojox.mobile._ScrollableMixin;
});

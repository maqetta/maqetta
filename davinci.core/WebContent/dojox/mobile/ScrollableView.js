dojo.provide("dojox.mobile.ScrollableView");

dojo.require("dijit._WidgetBase");
dojo.require("dojox.mobile");
dojo.require("dojox.mobile._ScrollableMixin");

// summary:
//		A container that has a touch scrolling capability.
// description:
//		ScrollableView is a subclass of View (=dojox.mobile.View).
//		Unlike the base View class, ScrollableView's domNode always stays
//		at the top of the screen and its height is "100%" of the screen.
//		In this fixed domNode, containerNode scrolls. Browser's default
//		scrolling behavior is disabled, and the scrolling machinery is
//		re-implemented with JavaScript. Thus the user does not need to use the
//		two-finger operation to scroll an inner DIV (containerNode).
//		The main purpose of this widget is to realize fixed-positioned header
//		and/or footer bars.

dojo.declare(
	"dojox.mobile.ScrollableView",
	[dojox.mobile.View, dojox.mobile._ScrollableMixin],
{
	flippable: false,

	buildRendering: function(){
		this.inherited(arguments);
		dojo.addClass(this.domNode, "mblScrollableView");
		this.domNode.style.overflow = "hidden";
		this.domNode.style.top = "0px";
		this.domNode.style.height = "100%";
		this.containerNode = dojo.create("DIV",
			{className:"mblScrollableViewContainer"}, this.domNode);
		this.containerNode.style.position = "absolute";
		if(this.scrollDir === "v" || this.flippable){
			this.containerNode.style.width = "100%";
		}
		this.reparent();
		this.findAppBars();
	},

	addChild: function(widget){
		var c = widget.domNode;
		var fixed = this._checkFixedBar(c, true);
		if(fixed){
			this.domNode.appendChild(c);
			if(fixed === "top"){
				this.fixedHeaderHeight = c.offsetHeight;
				this.containerNode.style.paddingTop = this.fixedHeaderHeight + "px";
			}else if(fixed === "bottom"){
				this.fixedFooterHeight = c.offsetHeight;
				this.isLocalFooter = true;
				c.style.bottom = "0px";
			}
			this.resizeView();
		}else{
			this.containerNode.appendChild(c);
		}
	},

	reparent: function(){
		// move all the children, except header and footer, to containerNode.
		var i, idx, len, c;
		for(i = 0, idx = 0, len = this.domNode.childNodes.length; i < len; i++){
			c = this.domNode.childNodes[idx];
			// search for view-specific header or footer
			if(c === this.containerNode || this._checkFixedBar(c, true)){
				idx++;
				continue;
			}
			this.containerNode.appendChild(this.domNode.removeChild(c));
		}
	},

	findAppBars: function(){
		// search for application-specific header or footer
		var i, len, c;
		for(i = 0, len = dojo.body().childNodes.length; i < len; i++){
			c = dojo.body().childNodes[i];
			this._checkFixedBar(c, false);
		}
		if(this.domNode.parentNode){
			for(i = 0, len = this.domNode.parentNode.childNodes.length; i < len; i++){
				c = this.domNode.parentNode.childNodes[i];
				this._checkFixedBar(c, false);
			}
		}
		this.fixedHeaderHeight = this.fixedHeader ? this.fixedHeader.offsetHeight : 0;
		this.fixedFooterHeight = this.fixedFooter ? this.fixedFooter.offsetHeight : 0;
	},

	_checkFixedBar: function(/*DomNode*/node){
		if(node.nodeType === 1){
			var fixed = node.getAttribute("fixed")
				|| (dijit.byNode(node) && dijit.byNode(node).fixed);
			if(fixed){
				dojo.style(node, {
					position: "absolute",
					width: "100%",
					zIndex: 1
				});
			}
			if(fixed === "top"){
				node.style.top = "0px";
				this.fixedHeader = node;
				return fixed;
			}else if(fixed === "bottom"){
				this.fixedFooter = node;
				return fixed;
			}
		}
		return null;
	},

	onAfterTransitionIn: function(moveTo, dir, transition, context, method){
		this.flashScrollBar();
	}
});

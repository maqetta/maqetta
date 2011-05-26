define(["dojo/_base/html", "dijit/place", "dijit/_WidgetBase"], function(dhtml, place, WidgetBase) {

	return dojo.declare("dojox.mobile.Tooltip", dijit._WidgetBase, {
		// summary:
		//		A non-templated popup bubble widget
		//

		baseClass: "mblTooltip mblTooltipHidden",

		buildRendering: function(){
			// create the helper nodes here in case the user overwrote domNode.innerHTML
			this.inherited(arguments);
			this.anchor = dojo.create("div", {"class":"mblTooltipAnchor"}, this.domNode, "first");
			this.arrow = dojo.create("div", {"class":"mblTooltipArrow"}, this.anchor);
			this.innerArrow = dojo.create("div", {"class":"mblTooltipInnerArrow"}, this.anchor);
		},

		show: function(/*DomNode*/ aroundNode, positions){
			// summary:
			//		Pop up the tooltip and point to aroundNode using the best position
			// positions:
			//		Ordered list of positions to try matching up.
			//			* before: places drop down before the aroundNode
			//			* after: places drop down after the aroundNode
			//			* above-centered: drop down goes above aroundNode
			//			* below-centered: drop down goes below aroundNode
			var connectorClasses = {
				"MRM": "mblTooltipAfter",
				"MLM": "mblTooltipBefore",
				"BMT": "mblTooltipBelow",
				"TMB": "mblTooltipAbove",
				"BLT": "mblTooltipBelow",
				"TLB": "mblTooltipAbove",
				"BRT": "mblTooltipBelow",
				"TRB": "mblTooltipAbove",
				"TLT": "mblTooltipBefore",
				"TRT": "mblTooltipAfter",
				"BRB": "mblTooltipAfter",
				"BLB": "mblTooltipBefore"
			};
			dojo.removeClass(this.domNode, ["mblTooltipAfter","mblTooltipBefore","mblTooltipBelow","mblTooltipAbove"]);
			var best = place.around(this.domNode, aroundNode, positions || ['below-centered', 'above-centered', 'after', 'before'], this.isLeftToRight());
			var connectorClass = connectorClasses[best.corner + best.aroundCorner.charAt(0)] || '';
			dojo.addClass(this.domNode, connectorClass);
			var pos = dojo.position(aroundNode, true);
			dojo.style(this.anchor, (connectorClass == "mblTooltipAbove" || connectorClass == "mblTooltipBelow")
				? { top: "", left: Math.max(0, pos.x - best.x + (pos.w >> 1) - (this.arrow.offsetWidth >> 1)) + "px" }
				: { left: "", top: Math.max(0, pos.y - best.y + (pos.h >> 1) - (this.arrow.offsetHeight >> 1)) + "px" }
			);
			dojo.replaceClass(this.domNode, "mblTooltipVisible", "mblTooltipHidden");
			this.resize = dojo.hitch(this, "show", aroundNode, positions); // orientation changes
			return best;
		},

		hide: function(){
			// summary:
			//		Pop down the tooltip
			this.resize = undefined;
			dojo.replaceClass(this.domNode, "mblTooltipHidden", "mblTooltipVisible");
		},

		onBlur: function(/*Event*/e){
			return true; // touching outside the overlay area does call hide() by default
		},

		destroy: function(){
			if(this.anchor){
				this.anchor.removeChild(this.innerArrow);
				this.anchor.removeChild(this.arrow);
				this.domNode.removeChild(this.anchor);
				this.anchor = this.arrow = this.innerArrow = undefined;
			}
			this.inherited(arguments);
		}
	});
});

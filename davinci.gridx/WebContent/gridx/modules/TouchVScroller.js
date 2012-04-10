define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/dom-style",
	"../core/_Module",
	"./VScroller",
	"dojox/mobile/_ScrollableMixin"
], function(kernel, declare, domStyle, _Module, VScroller){
	kernel.experimental('gridx/modules/TouchVScroller');
	return _Module.register(
	declare(VScroller, {
		_init: function(){
			var g = this.grid, mn = g.mainNode, bn = g.bodyNode,
				scrollable = new dojox.mobile.scrollable(dojo, dojox);
			domStyle.set(this.domNode, "display", "none");
			domStyle.set(mn, "overflow", "hidden");
			domStyle.set(bn, "height", "auto");
			domStyle.set(g.headerNode.firstChild.firstChild, "margin-right", "0px"); // FIXME: Header assumes VScroller
			scrollable.init({
				domNode: mn, 
				containerNode: bn, 
				noResize: true
			});
		}
	}));
});

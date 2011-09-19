dojo.provide("dojox.mobile._ScrollableMixin");

dojo.require("dijit._WidgetBase");
dojo.require("dojox.mobile.scrollable");

// summary:
//		Mixin for widgets to have a touch scrolling capability.
// description:
//		Actual implementation is in scrollable.js.
//		scrollable.js is not a dojo class, but just a collection
//		of functions. This module makes scrollable.js a dojo class.

dojo.declare(
	"dojox.mobile._ScrollableMixin",
	null,
{
	fixedHeader: "",
	fixedFooter: "",

	destroy: function(){
		this.cleanup();
		this.inherited(arguments);
	},

	startup: function(){
		var params = {};
		if(this.fixedHeader){
			params.fixedHeaderHeight = dojo.byId(this.fixedHeader).offsetHeight;
		}
		if(this.fixedFooter){
			var node = dojo.byId(this.fixedFooter);
			if(node.parentNode == this.domNode){ // local footer
				this.isLocalFooter = true;
				node.style.bottom = "0px";
			}
			params.fixedFooterHeight = node.offsetHeight;
		}
		this.init(params);
		this.inherited(arguments);
	}
});
(function(){
	var obj = new dojox.mobile.scrollable();
	dojo.extend(dojox.mobile._ScrollableMixin, obj);
	if(dojo.version.major == 1 && dojo.version.minor == 4){
		// dojo-1.4 had a problem in inheritance behavior. (#10709 and #10788)
		// This is a workaround to avoid the problem.
		// There is no such a problem in dojo-1.3 and dojo-1.5.
		dojo.mixin(dojox.mobile._ScrollableMixin._meta.hidden, obj);
	}
})();

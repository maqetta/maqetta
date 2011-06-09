define([
	"dojo/_base/kernel",
	".",
	"./_Widget",
	"./_TemplatedMixin",
	"dojo/_base/declare", // dojo.declare
	"dojo/_base/html" // dojo.setSelectable
], function(dojo, dijit){

	// module:
	//		dijit/ToolbarSeparator
	// summary:
	//		A spacer between two `dijit.Toolbar` items


	dojo.declare("dijit.ToolbarSeparator", [dijit._Widget, dijit._TemplatedMixin], {
		// summary:
		//		A spacer between two `dijit.Toolbar` items

		templateString: '<div class="dijitToolbarSeparator dijitInline" role="presentation"></div>',

		buildRendering: function(){
			this.inherited(arguments);
			dojo.setSelectable(this.domNode, false);
		},

		isFocusable: function(){
			// summary:
			//		This widget isn't focusable, so pass along that fact.
			// tags:
			//		protected
			return false;
		}
	});


	return dijit.ToolbarSeparator;
});

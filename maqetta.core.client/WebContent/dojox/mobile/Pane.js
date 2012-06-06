define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dijit/_Contained",
	"dijit/_WidgetBase"
], function(array, declare, Contained, WidgetBase){

	// module:
	//		dojox/mobile/Pane
	// summary:
	//		A simple div-wrapper pane widget.

	return declare("dojox.mobile.Pane", [WidgetBase, Contained], {
		// summary:
		//		A simple pane widget.
		// description:
		//		Pane is a simple pane widget that can be used for any purposes.
		//		It is a widget, but can be regarded as a simple <div> element.

		baseClass: "mblPane",

		buildRendering: function(){
			this.inherited(arguments);
			if(!this.containerNode){
				// set containerNode so that getChildren() works
				this.containerNode = this.domNode;
			}
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		}
	});
});

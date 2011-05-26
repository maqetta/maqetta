define(["dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained"], function(WidgetBase,Container,Contained){
	// module:
	//		dojox/mobile/RoundRectList
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.RoundRectList", [dijit._WidgetBase,dijit._Container,dijit._Contained], {
		transition: "slide",
		iconBase: "",
		iconPos: "",
		select: "", // "single", "multiple", or ""
		stateful: false, // keep the selection state or not

		buildRendering: function(){
			this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("UL");
			this.domNode.className = "mblRoundRectList";
		},
	
		onCheckStateChanged: function(/*Widget*/listItem, /*String*/newState){
			// Stub function to connect to from your application.
		},

		_setStatefulAttr: function(stateful){
			this.stateful = stateful;
			dojo.forEach(this.getChildren(), function(child){
				child.setArrow && child.setArrow();
			});
		},

		deselectItem: function(/*ListItem*/item){
			item.deselectItem();
		},

		deselectAll: function(){
			dojo.forEach(this.getChildren(), function(child){
				child.deselect && child.deselect();
			});
		},

		selectItem: function(/*ListItem*/item){
			item.select();
		}
	});
});

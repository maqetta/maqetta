define(["./RoundRectList"], function(RoundRectList){
	return dojo.declare("dojox.mobile.EdgeToEdgeList", dojox.mobile.RoundRectList, {
		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.className = "mblEdgeToEdgeList";
		}
	});
});

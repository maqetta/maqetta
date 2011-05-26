define(["dojo/_base/html", "dojo/_base/array", "dijit/_WidgetBase","dijit/_Container","dijit/_Contained"],function(dhtml,darray, WidgetBase,Container,Contained){
	return dojo.declare("dojox.mobile.FixedSplitterPane",[dijit._WidgetBase,dijit._Container,dijit._Contained],{
		buildRendering: function(){
			this.inherited(arguments);
			dojo.addClass(this.domNode, "mblFixedSplitterPane");
		},

		resize: function(){
			dojo.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		}
	});
});

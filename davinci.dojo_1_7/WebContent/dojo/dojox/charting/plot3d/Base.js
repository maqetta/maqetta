define(["dojo/_base/kernel", "dojo/_base/declare"], function(dojo) {

	return dojo.declare("dojox.charting.plot3d.Base", null, {
		constructor: function(width, height, kwArgs){
			this.width  = width;
			this.height = height;
		},
		setData: function(data){
			this.data = data ? data : [];
			return this;
		},
		getDepth: function(){
			return this.depth;
		},
		generate: function(chart, creator){
		}
	});
});


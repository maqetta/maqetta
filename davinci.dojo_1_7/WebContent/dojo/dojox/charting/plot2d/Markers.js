define(["dojo/_base/declare", "./Default"], function(declare, Default){

return dojo.declare("dojox.charting.plot2d.Markers", dojox.charting.plot2d.Default, {
	//	summary:
	//		A convenience plot to draw a line chart with markers.
	constructor: function(){
		//	summary:
		//		Set up the plot for lines and markers.
		this.opt.markers = true;
	}
});
});

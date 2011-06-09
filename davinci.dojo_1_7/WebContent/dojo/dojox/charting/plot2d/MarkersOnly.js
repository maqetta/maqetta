define(["dojo/_base/kernel", "dojo/_base/declare", "./Default"], function(dojo, declare, Default){

	return dojo.declare("dojox.charting.plot2d.MarkersOnly", dojox.charting.plot2d.Default, {
		//	summary:
		//		A convenience object to draw only markers (like a scatter but not quite).
		constructor: function(){
			//	summary:
			//		Set up our default plot to only have markers and no lines.
			this.opt.lines   = false;
			this.opt.markers = true;
		}
	});
});

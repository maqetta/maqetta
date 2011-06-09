define(["dojo/_base/kernel", "dojo/_base/declare", "./Stacked"], 
	function(dojo, declare, Stacked){

	return dojo.declare("dojox.charting.plot2d.StackedLines", dojox.charting.plot2d.Stacked, {
		//	summary:
		//		A convenience object to create a stacked line chart.
		constructor: function(){
			//	summary:
			//		Force our Stacked base to be lines only.
			this.opt.lines = true;
		}
	});
});

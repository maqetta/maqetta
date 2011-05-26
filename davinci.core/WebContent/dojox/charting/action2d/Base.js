dojo.provide("dojox.charting.action2d.Base");

dojo.require("dojo.fx.easing");
dojo.require("dojox.lang.functional.object");
dojo.require("dojox.gfx.fx");

/*=====
dojox.charting.action2d.__BaseCtorArgs = function(duration, easing){
 	//	summary:
	//		The base keyword arguments object for creating an action2d.
	//	duration: Number?
	//		The amount of time in milliseconds for an animation to last.  Default is 400.
	//	easing: dojo.fx.easing.*?
	//		An easing object (see dojo.fx.easing) for use in an animation.  The
	//		default is dojo.fx.easing.backOut.
	this.duration = duration;
	this.easing = easing;
}
=====*/
(function(){
	var DEFAULT_DURATION = 400,	// ms
		DEFAULT_EASING   = dojo.fx.easing.backOut,
		df = dojox.lang.functional;

	dojo.declare("dojox.charting.action2d.Base", null, {

		overOutEvents: {onmouseover: 1, onmouseout: 1},

		constructor: function(chart, plot, kwargs){
			//	summary:
			//		Create a new base Action.
			//	chart: dojox.charting.Chart2D
			//		The chart this action applies to.
			//	plot: String?
			//		The name of the plot this action belongs to.  If none is passed "default" is assumed.
			//	kwargs: dojox.charting.action2d.__BaseCtorArgs?
			//		Optional arguments for the action.
			this.chart = chart;
			this.plot = plot || "default";
			this.anim = {};

			// process common optional named parameters
			if(!kwargs){ kwargs = {}; }
			this.duration = kwargs.duration ? kwargs.duration : DEFAULT_DURATION;
			this.easing   = kwargs.easing   ? kwargs.easing   : DEFAULT_EASING;
		},

		connect: function(){
			//	summary:
			//		Connect this action to the given plot.
			this.handle = this.chart.connectToPlot(this.plot, this, "process");
		},

		disconnect: function(){
			//	summary:
			//		Disconnect this action from the given plot, if connected.
			if(this.handle){
				dojo.disconnect(this.handle);
				this.handle = null;
			}
		},

		reset: function(){
			//	summary:
			//		Reset the action.
		},

		destroy: function(){
			//	summary:
			//		Do any cleanup needed when destroying parent elements.
			this.disconnect();
			df.forIn(this.anim, function(o){
				df.forIn(o, function(anim){
					anim.action.stop(true);
				});
			});
			this.anim = {};
		}
	});
})();

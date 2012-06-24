define(["dojo/_base/declare", "dojox/widget/_Invalidating"], function(declare, _Invalidating){

	/*=====
	 var _Invalidating = dojox.widget._Invalidating;
	 =====*/
	return declare("dojox.dgauges.IndicatorBase", _Invalidating, {
		//	summary:
		//		The base class for indicators. Basically, an indicator is used to render a value.

		value: null
	});
});

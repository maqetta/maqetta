/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/themes/PlotKit/purple",["./base","../../Theme"],function(pk,_1){
pk.purple=pk.base.clone();
pk.purple.chart.fill=pk.purple.plotarea.fill="#eee6f5";
pk.purple.colors=_1.defineColors({hue:271,saturation:60,low:40,high:88});
return pk.purple;
});

/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/themes/PlotKit/red",["./base","../../Theme"],function(pk,_1){
pk.red=pk.base.clone();
pk.red.chart.fill=pk.red.plotarea.fill="#f5e6e6";
pk.red.colors=_1.defineColors({hue:1,saturation:60,low:40,high:88});
return pk.red;
});

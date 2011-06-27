/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/themes/PlotKit/green",["./base","../../Theme"],function(pk,_1){
pk.green=pk.base.clone();
pk.green.chart.fill=pk.green.plotarea.fill="#eff5e6";
pk.green.colors=_1.defineColors({hue:82,saturation:60,low:40,high:88});
return pk.green;
});

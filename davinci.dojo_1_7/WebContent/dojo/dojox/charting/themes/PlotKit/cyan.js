/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/themes/PlotKit/cyan",["./base","../../Theme"],function(pk,_1){
pk.cyan=pk.base.clone();
pk.cyan.chart.fill=pk.cyan.plotarea.fill="#e6f1f5";
pk.cyan.colors=_1.defineColors({hue:194,saturation:60,low:40,high:88});
return pk.cyan;
});

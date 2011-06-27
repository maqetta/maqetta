/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/themes/PlotKit/orange",["./base","../../Theme"],function(pk,_1){
pk.orange=pk.base.clone();
pk.orange.chart.fill=pk.orange.plotarea.fill="#f5eee6";
pk.orange.colors=_1.defineColors({hue:31,saturation:60,low:40,high:88});
return pk.orange;
});

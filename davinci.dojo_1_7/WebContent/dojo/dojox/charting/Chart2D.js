define(["dojo/_base/kernel", "./Chart", 
	"./axis2d/Default", "./axis2d/Invisible", "./plot2d/Default", "./plot2d/Lines", "./plot2d/Areas",
	"./plot2d/Markers", "./plot2d/MarkersOnly", "./plot2d/Scatter", "./plot2d/Stacked", "./plot2d/StackedLines",
	"./plot2d/StackedAreas", "./plot2d/Columns", "./plot2d/StackedColumns", "./plot2d/ClusteredColumns",
	"./plot2d/Bars", "./plot2d/StackedBars", "./plot2d/ClusteredBars", "./plot2d/Grid", "./plot2d/Pie",
	"./plot2d/Bubble", "./plot2d/Candlesticks", "./plot2d/OHLC", "./plot2d/Spider"], function(dojo, Chart){
	dojo.deprecated("dojox.charting.Chart2D", "Use dojo.charting.Chart instead and require all other components explicitly", "2.0");
	return dojox.charting.Chart2D = Chart;
});

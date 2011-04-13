dojo.provide("dojox.charting.themes.PlotKit.blue");
dojo.require("dojox.charting.themes.PlotKit.base");

(function(){
	var dc = dojox.charting, pk = dc.themes.PlotKit;

	pk.blue = pk.base.clone();
	pk.blue.chart.fill = pk.blue.plotarea.fill = "#e7eef6";
	pk.blue.colors = dc.Theme.defineColors({hue: 217, saturation: 60, low: 40, high: 88});
})();

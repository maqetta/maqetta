dojo.provide("dojox.charting.themes.PlotKit.orange");
dojo.require("dojox.charting.themes.PlotKit.base");

(function(){
	var dc = dojox.charting, pk = dc.themes.PlotKit;

	pk.orange = pk.base.clone();
	pk.orange.chart.fill = pk.orange.plotarea.fill = "#f5eee6";
	pk.orange.colors = dc.Theme.defineColors({hue: 31, saturation: 60, low: 40, high: 88});
})();

dojo.provide("dojox.charting.themes.PlotKit.red");
dojo.require("dojox.charting.themes.PlotKit.base");

(function(){
	var dc = dojox.charting, pk = dc.themes.PlotKit;

	pk.red = pk.base.clone();
	pk.red.chart.fill = pk.red.plotarea.fill = "#f5e6e6";
	pk.red.colors = dc.Theme.defineColors({hue: 1, saturation: 60, low: 40, high: 88});
})();

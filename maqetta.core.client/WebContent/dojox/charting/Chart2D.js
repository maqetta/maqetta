dojo.provide("dojox.charting.Chart2D");

dojo.deprecated("dojox.charting.Chart2D", "Use dojo.charting.Chart instead and require all other components explicitly", "2.0");

// require all axes to support references by name
dojo.require("dojox.charting.axis2d.Default");
dojo.require("dojox.charting.axis2d.Invisible");

// require all plots to support references by name
dojo.require("dojox.charting.plot2d.Default");
dojo.require("dojox.charting.plot2d.Lines");
dojo.require("dojox.charting.plot2d.Areas");
dojo.require("dojox.charting.plot2d.Markers");
dojo.require("dojox.charting.plot2d.MarkersOnly");
dojo.require("dojox.charting.plot2d.Scatter");
dojo.require("dojox.charting.plot2d.Stacked");
dojo.require("dojox.charting.plot2d.StackedLines");
dojo.require("dojox.charting.plot2d.StackedAreas");
dojo.require("dojox.charting.plot2d.Columns");
dojo.require("dojox.charting.plot2d.StackedColumns");
dojo.require("dojox.charting.plot2d.ClusteredColumns");
dojo.require("dojox.charting.plot2d.Bars");
dojo.require("dojox.charting.plot2d.StackedBars");
dojo.require("dojox.charting.plot2d.ClusteredBars");
dojo.require("dojox.charting.plot2d.Grid");
dojo.require("dojox.charting.plot2d.Pie");
dojo.require("dojox.charting.plot2d.Bubble");
dojo.require("dojox.charting.plot2d.Candlesticks");
dojo.require("dojox.charting.plot2d.OHLC");
dojo.require("dojox.charting.plot2d.Spider");

// require the main file
dojo.require("dojox.charting.Chart");

dojox.charting.Chart2D = dojox.charting.Chart;

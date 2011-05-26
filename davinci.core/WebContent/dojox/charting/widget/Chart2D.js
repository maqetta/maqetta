dojo.provide("dojox.charting.widget.Chart2D");

dojo.deprecated("dojox.charting.widget.Chart2D", "Use dojo.charting.widget.Chart instead and require all other components explicitly", "2.0");

dojo.require("dojox.charting.widget.Chart");

// require all actions to support references by name
dojo.require("dojox.charting.action2d.Highlight");
dojo.require("dojox.charting.action2d.Magnify");
dojo.require("dojox.charting.action2d.MoveSlice");
dojo.require("dojox.charting.action2d.Shake");
dojo.require("dojox.charting.action2d.Tooltip");

// require Chart2D to get compatibility on chart type reference by name
dojo.require("dojox.charting.Chart2D");

dojox.charting.widget.Chart2D =  dojox.charting.widget.Chart;

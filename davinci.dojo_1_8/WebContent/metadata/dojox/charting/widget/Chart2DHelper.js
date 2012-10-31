define([
	"davinci/ve/metadata"
], function(Metadata) {

var Chart2DHelper = function() {};
Chart2DHelper.prototype = {

	getContainerNode: function(/*Widget*/ widget){
		if(!widget){
			return undefined;
		}
		
		if(widget.containerNode || widget.domNode){
			return(widget.containerNode || widget.domNode);
		}
		
		return undefined;
	},
	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget){
			return undefined;
		}
		var childrenData = [];
		var plotType = [];
		if(widget.dijitWidget.chart.axes){
			var axes = widget.dijitWidget.chart.axes;
			for (var axis in axes) {
				var axisData = widget.dijitWidget.chart.getAxis(axis);
				var axisWidget = {
					type: "html.div",
					properties: this.getAxisProperties(axisData)
				};
				if(axisWidget){
					childrenData.push(axisWidget);
				}
			}
		}
		if(widget.dijitWidget.chart.stack){
			dojo.forEach(widget.dijitWidget.chart.stack, function(plot){
				var plotData = {
					type: "html.div",
					properties: this.getPlotProperties(plot)
				};
				if(plotData){
					childrenData.push(plotData);
				}
			});
		}
		if(widget.dijitWidget.chart.series){
			dojo.forEach(widget.dijitWidget.chart.series, function(s){
				var seriesData = {
					type: "html.div",
					properties: {
						"class": "series",
						name: s.name,
						data: s.data
					}
				};
				if(seriesData){
					childrenData.push(seriesData);
				}
			});
		}
		if(childrenData.length === 0){
			return undefined;
		}
		return childrenData;
	},
	
	// FIXME: Original code from dojoy days. Commented out because currently untested.
	// Need to review and decide whether to resurrect.	
	// 
	// getPropertyValue: function(/*Widget*/ widget, /*String*/ name){
	// 	if(!widget || !widget.dijitWidget.chart.stack[0]){
	// 		return undefined;
	// 	}
	// 	var properties = [];
	// 	if(widget.dijitWidget.chart.stack){
	// 		properties = widget.dijitWidget.chart.stack[0].opt;
	// 		dojo.mixin(properties, properties, widget.dijitWidget.chart);
	// 		return(properties[name]);
	// 	}
	// },
	
	getAxisProperty: function(axis, name){
		if(!axis){
			return undefined;
		}
		var properties = axis.opt;
		dojo.mixin(properties, properties, axis.optionalParams);
		return(properties[name]);
	},
	
	getAxisProperties: function(axis){
		if(!axis){
			return undefined;
		}
		var axisProperties = {};
		axisProperties["class"] = "axis";
		axisProperties.name = axis.name;
		var properties = axis.opt;
		var defaultProps = dojo.mixin({}, axis.defaultParams, axis.optionalParams);
		for(var property in properties){
			var defaultProp = defaultProps[property];
			if(defaultProp != properties[property]){
				axisProperties[property] = properties[property];
			}
		}
		return axisProperties;
	},
	
	getPlotProperties: function(plot){
		if(!plot){
			return undefined;
		}
		var plotProps = {};
		plotProps["class"] = "plot";
		plotProps.name = plot.name;
		
		var type = plot.declaredClass;
		type = type.split(".");
		var pType = type[type.length-1];
		plotProps.type = pType;
		
		var metadata = Metadata.getMetadata(plot.declaredClass);
		var properties = metadata.properties;
		var plotProperties = plot.opt;
		var defaultProps = plot.defaultParams;
		
		for(var name in properties){
			var value = plotProperties[name];
			if(value != defaultProps[name]){
				plotProps[name] = value;
			}
		}
		return plotProps;
	},
	
	getPlotProperty: function(plot, name){
		if(!plot){
			return undefined;
		}
		return plot.opt[name];
	},
	
	getSeriesProperty: function(series, name){
		if(!series){
			return undefined;
		}
		return series[name];
	}

};

return Chart2DHelper;

});
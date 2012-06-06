define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojox/mvc/at"
], function(darray, declare, lang, at){
	return declare("dojox.mvc.StatefulSeries", null, {
		// summary:
		//		Chart data plugin ("series") that watches for properties specified in dojox.mvc.at handles in the given data.
		//		At initialization, and when the properties are updated, creates the data from data given and updates the chart.

		constructor: function(/*Anything[]*/ items){
			var _self = this;
			function pushDataChanges(){
				if(_self.series){
					_self.series.chart.updateSeries(_self.series.name, _self);
					_self.series.chart.delayedRender();
				}
			}
			this._handles = [];
			this.data = darray.map(items, function(item, idx){
				if((item || {}).atsignature == "dojox.mvc.at"){
					var target = item.target, targetProp = item.targetProp;
					if(lang.isString(target)){
						throw new Error("Literal-based dojox/mvc/at is not supported in dojox.mvc.StatefulSeries.");
					}
					if(item.bindDirection && !(item.bindDirection & at.from)){
						console.warn("Data binding bindDirection option is ignored in dojox.mvc.StatefulSeries.");
					}
					if(targetProp && lang.isFunction(target.set) && lang.isFunction(target.watch)){
						var converter = item.converter, formatFunc = (converter || {}).format && lang.hitch({target: target, source: this}, converter.format);
						this._handles.push(target.watch(targetProp, function(name, old, current){
							_self.data[idx] = formatFunc ? formatFunc(current) : current;
							pushDataChanges();
						}));
					}
					return !targetProp ? target : lang.isFunction(target.get) ? target.get(targetProp) : target[targetProp];
				}else{
					return item;
				}
			}, this);
			pushDataChanges();
		},

		destroy: function(){
			for(var h = null; h = this._handles.pop();){
				h.unwatch();
			}
		},

		setSeriesObject: function(series){
			this.series = series;
		}
	});
});

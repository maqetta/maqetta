define(["dojo/_base/array", "dojo/_base/declare", "dojo/_base/html", "dojo/query", 
	"./Chart", "../themes/GreySkies", "../plot2d/Lines"], function(dojo, declare, dhtml, dquery, Chart, GreySkies, Lines){

	var d = dojo;

	dojo.declare("dojox.charting.widget.Sparkline",
		dojox.charting.widget.Chart,
		{
			theme: dojox.charting.themes.GreySkies,
			margins: { l: 0, r: 0, t: 0, b: 0 },
			type: "Lines",
			valueFn: "Number(x)",
			store: "",
			field: "",
			query: "",
			queryOptions: "",
			start: "0",
			count: "Infinity",
			sort: "",
			data: "",
			name: "default",
			buildRendering: function(){
				var n = this.srcNodeRef;
				if(	!n.childNodes.length || // shortcut the query
					!d.query("> .axis, > .plot, > .action, > .series", n).length){
					var plot = document.createElement("div");
					d.attr(plot, {
						"class": "plot",
						"name": "default",
						"type": this.type
					});
					n.appendChild(plot);

					var series = document.createElement("div");
					d.attr(series, {
						"class": "series",
						plot: "default",
						name: this.name,
						start: this.start,
						count: this.count,
						valueFn: this.valueFn
					});
					d.forEach(
						["store", "field", "query", "queryOptions", "sort", "data"],
						function(i){
							if(this[i].length){
								d.attr(series, i, this[i]);
							}
						},
						this
					);
					n.appendChild(series);
				}
				this.inherited(arguments);
			}
		}
	);
});

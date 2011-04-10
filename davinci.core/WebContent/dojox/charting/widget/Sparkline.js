dojo.provide("dojox.charting.widget.Sparkline");

dojo.require("dojox.charting.widget.Chart2D");
dojo.require("dojox.charting.themes.ET.greys");

(function(){

	var d = dojo;

	dojo.declare("dojox.charting.widget.Sparkline",
		dojox.charting.widget.Chart2D,
		{
			theme: dojox.charting.themes.ET.greys,
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

})();

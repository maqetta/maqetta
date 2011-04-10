dojo.provide("dojox.charting.widget.Legend");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("dojox.lang.functional.array");
dojo.require("dojox.lang.functional.fold");

dojo.declare("dojox.charting.widget.Legend", [dijit._Widget, dijit._Templated], {
	// summary: A legend for a chart. A legend contains summary labels for 
	// each series of data contained in the chart.
	//
	// Set the horizontal attribute to boolean false to layout legend labels vertically.
	// Set the horizontal attribute to a number to layout legend labels in horizontal
	// rows each containing that number of labels (except possibly the last row).
	//
	// (Line or Scatter charts (colored lines with shape symbols) )
	// -o- Series1		-X- Series2		-v- Series3
	//
	// (Area/Bar/Pie charts (letters represent colors))
	// [a] Series1		[b] Series2		[c] Series3
	
	chartRef:   "",
	horizontal: true,
	swatchSize: 18,
	
	templateString: "<table dojoAttachPoint='legendNode' class='dojoxLegendNode'><tbody dojoAttachPoint='legendBody'></tbody></table>",
	
	legendNode: null,
	legendBody: null,
	
	postCreate: function(){
		if(!this.chart){
			if(!this.chartRef){ return; }
			this.chart = dijit.byId(this.chartRef);
			if(!this.chart){
				var node = dojo.byId(this.chartRef);
				if(node){
					this.chart = dijit.byNode(node);
				}else{
					console.log("Could not find chart instance with id: " + this.chartRef);
					return;
				}
			}
			this.series = this.chart.chart.series;
		}else{
			this.series = this.chart.series;
		}
		
		this.refresh();
	},
	refresh: function(){
		// summary: regenerates the legend to reflect changes to the chart
		
		var df = dojox.lang.functional;

		// cleanup
		if(this._surfaces){
			dojo.forEach(this._surfaces, function(surface){
				surface.destroy();
			});
		}
		this._surfaces = [];
		while(this.legendBody.lastChild){
			dojo.destroy(this.legendBody.lastChild);
		}

		if(this.horizontal){
			dojo.addClass(this.legendNode, "dojoxLegendHorizontal");
			// make a container <tr>
			this._tr = dojo.doc.createElement("tr");
			this.legendBody.appendChild(this._tr);
			this._inrow = 0;
		}
		
		var s = this.series;
		if(s.length == 0){
			return;
		}
		if(s[0].chart.stack[0].declaredClass == "dojox.charting.plot2d.Pie"){
			var t = s[0].chart.stack[0];
			if(typeof t.run.data[0] == "number"){
				var filteredRun = df.map(t.run.data, "Math.max(x, 0)");
				if(df.every(filteredRun, "<= 0")){
					return;
				}
				var slices = df.map(filteredRun, "/this", df.foldl(filteredRun, "+", 0));
				dojo.forEach(slices, function(x, i){
					this._addLabel(t.dyn[i], t._getLabel(x * 100) + "%");
				}, this);
			}else{
				dojo.forEach(t.run.data, function(x, i){
					this._addLabel(t.dyn[i], x.legend || x.text || x.y);
				}, this);
			}
		}else{
			dojo.forEach(s, function(x){
				this._addLabel(x.dyn, x.legend || x.name);
			}, this);
		}
	},
	_addLabel: function(dyn, label){
		// create necessary elements
		var icon = dojo.doc.createElement("td"),
			text = dojo.doc.createElement("td"),
			div  = dojo.doc.createElement("div");
		dojo.addClass(icon, "dojoxLegendIcon");
		dojo.addClass(text, "dojoxLegendText");
		div.style.width  = this.swatchSize + "px";
		div.style.height = this.swatchSize + "px";
		icon.appendChild(div);
		
		// create a skeleton
		if(this._tr){
			// horizontal
			this._tr.appendChild(icon);
			this._tr.appendChild(text);
			if(++this._inrow === this.horizontal){
				// make a fresh container <tr>
				this._tr = dojo.doc.createElement("tr");
				this.legendBody.appendChild(this._tr);
				this._inrow = 0;
			}
		}else{
			// vertical
			var tr = dojo.doc.createElement("tr");
			this.legendBody.appendChild(tr);
			tr.appendChild(icon);
			tr.appendChild(text);
		}
		
		// populate the skeleton
		this._makeIcon(div, dyn);
		text.innerHTML = String(label);
	},
	_makeIcon: function(div, dyn){
		var mb = { h: this.swatchSize, w: this.swatchSize };
		var surface = dojox.gfx.createSurface(div, mb.w, mb.h);
		this._surfaces.push(surface);
		if(dyn.fill){
			// regions
			surface.createRect({x: 2, y: 2, width: mb.w - 4, height: mb.h - 4}).
				setFill(dyn.fill).setStroke(dyn.stroke);
		}else if(dyn.stroke || dyn.marker){
			// draw line
			var line = {x1: 0, y1: mb.h / 2, x2: mb.w, y2: mb.h / 2};
			if(dyn.stroke){
				surface.createLine(line).setStroke(dyn.stroke);
			}
			if(dyn.marker){
				// draw marker on top
				var c = {x: mb.w / 2, y: mb.h / 2};
				if(dyn.stroke){
					surface.createPath({path: "M" + c.x + " " + c.y + " " + dyn.marker}).
						setFill(dyn.stroke.color).setStroke(dyn.stroke);
				}else{
					surface.createPath({path: "M" + c.x + " " + c.y + " " + dyn.marker}).
						setFill(dyn.color).setStroke(dyn.color);
				}
			}
		}else{
			// nothing
			surface.createRect({x: 2, y: 2, width: mb.w - 4, height: mb.h - 4}).
				setStroke("black");
			surface.createLine({x1: 2, y1: 2, x2: mb.w - 2, y2: mb.h - 2}).setStroke("black");
			surface.createLine({x1: 2, y1: mb.h - 2, x2: mb.w - 2, y2: 2}).setStroke("black");
		}
	}
});

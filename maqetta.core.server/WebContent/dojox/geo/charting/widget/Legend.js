dojo.provide("dojox.geo.charting.widget.Legend");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojox.lang.functional.array");
dojo.require("dojox.lang.functional.fold");

dojo.declare("dojox.geo.charting.widget.Legend",[dijit._Widget, dijit._Templated], {
	templateString: "<table dojoAttachPoint='legendNode' class='dojoxLegendNode'><tbody dojoAttachPoint='legendBody'></tbody></table>",
	horizontal:true,
	legendNode:null,
	legendBody:null,
	swatchSize:18,
	postCreate: function(){
		if(!this.map){return;}
		this.series = this.map.series;
		dojo.byId(this.map.container).appendChild(this.domNode);
		this.refresh();
	},
	refresh:function(){
		// cleanup
		while(this.legendBody.lastChild){
			dojo.destroy(this.legendBody.lastChild);
		}
		
		if(this.horizontal){
			dojo.addClass(this.legendNode,"dojoxLegendHorizontal");
			this._tr = dojo.doc.createElement("tr");
			this.legendBody.appendChild(this._tr);
		}
		
		var s = this.series;
		if(s.length == 0){return;}
		
		dojo.forEach(s,function(x){
			this._addLabel(x.color, x.name);
		},this);
	},
	_addLabel:function(color,label){
		var icon = dojo.doc.createElement("td");
		var text = dojo.doc.createElement("td");
		var div = dojo.doc.createElement("div");
		dojo.addClass(icon, "dojoxLegendIcon");
		dojo.addClass(text, "dojoxLegendText");
		div.style.width  = this.swatchSize + "px";
		div.style.height = this.swatchSize + "px";
		icon.appendChild(div);
		
		if(this.horizontal){
			this._tr.appendChild(icon);
			this._tr.appendChild(text);
		}else{
			var tr = dojo.doc.createElement("tr");
			this.legendBody.appendChild(tr);
			tr.appendChild(icon);
			tr.appendChild(text);
		}
		
		div.style.background = color;
		text.innerHTML = String(label);
	}
});

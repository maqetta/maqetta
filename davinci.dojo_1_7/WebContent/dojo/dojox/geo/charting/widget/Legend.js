
define(["dojo/_base/lang", "dojo/_base/declare","dojo/_base/html", "dojo/_base/window", "dijit/_Widget"],
							function(dojo,declare, dhtml, window, Widget) {

return dojo.declare("dojox.geo.charting.widget.Legend",dijit._Widget, {
	horizontal:true,
	legendBody:null,
	swatchSize:18,
	map:null,
	postCreate: function(){
		if(!this.map){return;}
		this.series = this.map.series;
		if (!this.domNode.parentNode) {
			// compatibility with older version : add to map domNode if not already attached to a parentNode.
			dojo.byId(this.map.container).appendChild(this.domNode);
		}
		this.refresh();
	},
	buildRendering: function(){  
		this.domNode = dojo.create("table",   
					{role: "group", "class": "dojoxLegendNode"});  
		this.legendBody = dojo.create("tbody", null, this.domNode);  
		this.inherited(arguments);  
 	},  

	refresh:function(){
		// cleanup
		while(this.legendBody.lastChild){
			dojo.destroy(this.legendBody.lastChild);
		}
		
		if(this.horizontal){
			dojo.addClass(this.domNode,"dojoxLegendHorizontal");
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
});

define([
	"dojo/_base/declare",
], function(declare){
	
	return declare("shapes._RectMixin", [], {

		buildRendering: function() {
			this.inherited(arguments);
			this._x = this.x - 0;	// -0 to force conversion to number
			this._y = this.y - 0;
			this._width = this.width - 0;
			this._height = this.height - 0;
			this._cornerRadius = this.cornerRadius ? this.cornerRadius - 0 : 0;
		},
		
		createGraphics: function(){
			var s_shape = '<rect'+
				' x="'+this._x+'"'+
				' y="'+this._y+'"'+
				' width="'+this._width+'"'+
				' height="'+this._height+'"'+
				' rx="'+this._cornerRadius+'"/>';
		    this.domNode.innerHTML = this._header + s_shape + this._footer;
			this._shape = dojo.query('rect',this.domNode)[0];		
			this._g = dojo.query('g.shapeg',this.domNode)[0];
			this._svgroot = dojo.query('svg',this.domNode)[0];
			this._svgroot.style.verticalAlign = "top";
			this._svgroot.style.overflow = "visible";
		}

	});
});

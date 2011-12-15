define([
	"dojo/_base/declare",
], function(declare){
	
	return declare("shapes._RectMixin", [], {

		//initialSizeSet: false,
		
		buildRendering: function() {
			this.inherited(arguments);
			// -0 to force conversion to number
			this._x = 0;
			this._y = 0;
			this._width = (this.width ? this.width : this.defaultWidth) - 0;
			this._height = (this.height ? this.height : this.defaultHeight) - 0;
			this._cornerRadius = this.cornerRadius - 0;
		},
				
		resize: function(){
			this._resize();
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

define([
	"dojo/_base/declare",
], function(declare){
	
	return declare("shapes._RectMixin", [], {

		initialSizeSet: false,
		
		buildRendering: function() {
			this.inherited(arguments);
			this._x = this.x - 0;	// -0 to force conversion to number
			this._y = this.y - 0;
			this._width = this.width - 0;
			this._height = this.height - 0;
			this._cornerRadius = this.cornerRadius ? this.cornerRadius - 0 : 0;
		},
				
		resize: function(){
			// If inline style has width or height in px units, and we haven't already
			// set initial size, then set the size from inline style width/height
			// Note: CreateTool calls ResizeCommand which ultimately puts puts initial size on inline style)
			var style = this.domNode ? this.domNode.style : undefined;
			if(style){
				var regex = /(\d+)px/;
				var w = style.width ? style.width.replace(regex,'$1') : undefined;
				var h = style.height ? style.height.replace(regex,'$1') : undefined;
				if(!this.initialSizeSet && w && h){
					this.initialSizeSet = true;
					this.width = this._width = w-0;	// -0 to convert to number
					this.height = this._height = h-0;
				}
			}
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

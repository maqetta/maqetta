define([
	"dojo/_base/declare",
], function(declare){
	
	return declare("shapes._CircleMixin", [], {

		buildRendering: function() {
			this.inherited(arguments);
			this._cx = this.cx - 0;	// -0 to force conversion to number
			this._cy = this.cy - 0;
			if(typeof this.rx == "undefined"){
				this._rx = this._ry = this.r - 0; // -0 to force conversion to number
			}else{
				this._rx = this.rx - 0;	
				this._ry = this.ry - 0;
			}
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
					this.rx = this._rx = w/2;
					this.ry = this._ry = h/2;
				}
			}
			this._resize();
		},
		
		createGraphics: function(){
			var rx = (typeof this._rx != "undefined") ? this._rx : this._r;
			var ry = (typeof this._ry != "undefined") ? this._ry : this._r;
			var s_shape = '<ellipse'+
				' cx="'+this._cx+'"'+
				' cy="'+this._cy+'"'+
				' rx="'+rx+'"'+
				' ry="'+ry+'"/>';
		    this.domNode.innerHTML = this._header + s_shape + this._footer;
			this._shape = dojo.query('ellipse',this.domNode)[0];		
			this._g = dojo.query('g.shapeg',this.domNode)[0];
			this._svgroot = dojo.query('svg',this.domNode)[0];
			this._svgroot.style.verticalAlign = "top";
			this._svgroot.style.overflow = "visible";
		}
	});
});

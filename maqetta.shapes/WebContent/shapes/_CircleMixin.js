define([
	"dojo/_base/declare",
], function(declare){
	
	return declare("shapes._CircleMixin", [], {

		buildRendering: function() {
			this.inherited(arguments);
<<<<<<< HEAD
			this._cx = this.cx - 0;	// -0 to force conversion to number
			this._cy = this.cy - 0;
			if(typeof this.rx == "undefined"){
				this._rx = this._ry = this.r - 0; // -0 to force conversion to number
			}else{
				this._rx = this.rx - 0;	
				this._ry = this.ry - 0;
			}
=======
			// -0 to force conversion to number
			this._rx = (this.rx ? this.rx : this.defaultRx) - 0;
			this._ry = (this.ry ? this.ry : this.defaultRy) - 0;
		},
		
		resize: function(){
			this._resize();
>>>>>>> master
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

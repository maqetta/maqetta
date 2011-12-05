define([
	"dojo/_base/declare",
], function(declare){
	
	return declare("shapes._TextMixin", [], {
	
		createGraphics: function(){
			dojo.addClass(this.domNode,'draw');
			dojo.addClass(this.domNode,'drawText');
			var s_shape = '<text>'+this.content+'</text>';
		    this.domNode.innerHTML = this._header + s_shape + this._footer;
			this._shape = dojo.query('text',this.domNode)[0];		
			this._g = dojo.query('g.shapeg',this.domNode)[0];
			this._svgroot = dojo.query('svg',this.domNode)[0];
			this._svgroot.style.verticalAlign = "top";
			this._svgroot.style.overflow = "visible";
		},
		
		resize: function(){
			this.inherited(arguments);
			/* Override this._bbox because not getting the correct result from Chrome.
			 * Maybe Chrome is clipping the bbox based on size of an ancestor node?
			 */
			/*
			var textElement = this._shape;
			var minx, miny, maxx, maxy;
			for(var i=0; i<textElement.textContent.length; i++){
				var extent = textElement.getExtentOfChar(i);
				var x1 = extent.x;
				var y1 = extent.y;
				var x2 = x1 + extent.width;
				var y2 = y1 + extent.height;
				if(i==0){
					minx = x1;
					miny = y1;
					maxx = x2;
					maxy = y2;
				}else{
					minx = (x1 < minx) ? x1 : minx;
					miny = (y1 < miny) ? y1 : miny;
					maxx = (x2 > maxx) ? x2 : maxx;
					maxy = (y2 > maxy) ? y2 : maxy;
				}
			}
			this._bbox.x = minx;
			this._bbox.y = miny;
			this._bbox.width = maxx - minx;
			this._bbox.height = maxy - miny;
			*/
	
			var domNodeStyle = this.domNode.style;
			// First time through, there will be no width and height properties on the domNode
			if(domNodeStyle.width.length == 0 || domNodeStyle.height.length == 0){
				var svgNodeStyle = this._svgroot.style;
				var w = this._bbox.width + 'px';
				var h = this._bbox.height + 'px';
				domNodeStyle.width = svgNodeStyle.width = w;
				domNodeStyle.height = svgNodeStyle.height = h;
			}
		}
	});
});

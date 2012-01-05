define([
	"dojo/_base/declare",
], function(declare){
	
	return declare("shapes._PathMixin", [], {

		/*
		 * Widget-specific bbox adjustments to address fact that getBbox
		 * for horiz and vert lines will be zero in both dimensions.
		 * This routine fixes bbox so that the dimension that is non-zero gets accounted for.
		 * Updates the bbox object in place
		 * @param {object} gbbox  Bounding box
		 */
		adjustBBox_Widget: function(gbbox){
			var minx = gbbox.x;
			var miny = gbbox.y;
			var maxx = minx + gbbox.width;
			var maxy = miny + gbbox.height;
			for (var i=0; i<this._points.length; i++){
				var x = this._points[i].x;
				var y = this._points[i].y;
				if(x<minx){
					minx = x;
				}
				if(y<miny){
					miny = y;
				}
				if(x>maxx){
					maxx = x;
				}
				if(y>maxy){
					maxy = y;
				}
			}
			gbbox.x = minx;
			gbbox.y = miny;
			gbbox.width = maxx - minx;
			gbbox.height = maxy - miny;
		},
		
		/*
		 * Returns the textual content for a marker element for an arrow
		 * @param {string} id Value of 'id' attribute on the marker element
		 * @param {string} orient Value for the 'orient' attribute on the marker element
		 * @return {string} Textual content for the marker element
		 */
		_arrow: function(id, orient){
			var s = '<marker id="'+id+'"';
			s += ' viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="'+orient+'">';
			s += '<path d="M 0 0 L 10 5 L 0 10 z"/>';
			s += '</marker>';
			return s;
		},
	
		/*
		 * Returns the textual content for a set of points
		 * @param {[object]} points Array of {x:<number>,y:<number>} 
		 * @return {string} SVG path data for the path
		 */
		_computePathData: function(points){
			var d='';
			for(var i=0; i<points.length; i++){
				d += (i==0) ? 'M' : 'L';
				d += points[i].x + ',' + points[i].y;
			}
			return d;
		},
	
	
		/*
		 * Returns the textual content for a marker element for an arrow
		 * @param {[object]} points Array of {x:<number>,y:<number>} 
		 * @param {object} params Arrowhead parameters object. Fields described below:
		 *    {start|end} params.type: Whether a start or end arrowhead
		 *    {number} params.width: Arrow head bottom/base size
		 *    {number} params.height: Distance from arrowhead base to arrowhead tip
		 *    {number} params.stroke: 'stroke' value
		 *    {number} params.strokeWidth: 'stroke-width' value
		 * @return {string} SVG path element for the arrowhead
		 */
		_computeArrowHead: function(points, params){
			if(!points || points.length<2 || !params || !params.type || !params.width || !params.height){
				return '';
			}
			var angle, s;
			var index0 = (params.type == 'start') ? 0 : points.length - 2;
			var x0 = points[index0].x;
			var y0 = points[index0].y;
			var x1 = points[index0+1].x;
			var y1 = points[index0+1].y;
			var dx = x1 - x0;
			var dy = y1 - y0;
			if(dx==0){
				angle = (dy>0) ? 90 : -90;
			}else{
				angle = Math.atan(dy/dx) * 180 / Math.PI;
				if(dx<0){
					angle += 180;
				}
			}
			var halfW = params.width/2;
			if(params.type == 'start'){
				if(params.arrowDir === 'backward'){
					s = '<path transform="translate('+x0+','+y0+') rotate('+angle+')" d="M'+params.height+',-'+halfW+'L0,0L'+params.height+','+halfW+'z"';
				}else{
					s = '<path transform="translate('+x0+','+y0+') rotate('+angle+')" d="M0,-'+halfW+'L'+params.height+',0L0,'+halfW+'z"';
				}
			}else{
				if(params.arrowDir === 'backward'){
					s = '<path transform="translate('+x1+','+y1+') rotate('+angle+')" d="M0,-'+halfW+'L-'+params.height+',0L0,'+halfW+'z"';
				}else{
					s = '<path transform="translate('+x1+','+y1+') rotate('+angle+')" d="M-'+params.height+',-'+halfW+'L0,0L-'+params.height+','+halfW+'z"';
				}
			}
			if(params.fill){
				s += ' fill="'+params.fill+'"';
			}
			if(params.stroke){
				s += ' stroke="'+params.stroke+'"';
			}
			if(params.strokeWidth){
				s += ' stroke-width="'+params.strokeWidth+'"';
			}
			s += '/>';
			return s;
		},
		
		_checkForwardBackward: function(val){
			return (val.toLowerCase() === 'forward' || val.toLowerCase() === 'backward');
		},
		
		createGraphics: function(){
			var pathdata = this._computePathData(this._points);
			//FIXME: Do we really need class="arrow"? Don't think so.
			var s_shape = '<path class="arrow" d="'+pathdata+'"/>';
			var stroke = dojo.style(this.domNode, 'stroke');
			var strokeWidth = dojo.style(this.domNode, 'stroke-width');
			var s_startarrow = this._checkForwardBackward(this.startarrow) ?
					this._computeArrowHead(this._points, {type:'start',arrowDir:this.startarrow,width:8,height:13,fill:stroke,stroke:stroke,strokeWidth:strokeWidth}) : '';
			var s_endarrow = this._checkForwardBackward(this.endarrow) ?
					this._computeArrowHead(this._points, {type:'end',arrowDir:this.endarrow,width:8,height:13,fill:stroke,stroke:stroke,strokeWidth:strokeWidth}) : '';
		    this.domNode.innerHTML = this._header + s_shape + s_startarrow + s_endarrow + this._footer;
			this._shape = dojo.query('path.arrow',this.domNode)[0];		
			this._g = dojo.query('g.shapeg',this.domNode)[0];
			this._svgroot = dojo.query('svg',this.domNode)[0];
			this._svgroot.style.verticalAlign = "top";
			this._svgroot.style.overflow = "visible";
		}

	});
});

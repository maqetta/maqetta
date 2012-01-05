define([
	"dojo/_base/declare",
	"dijit/_WidgetBase"
], function(declare, _WidgetBase){
			
	return declare("shapes._Shape", [_WidgetBase], {

		buildRendering: function(){
			this.inherited(arguments);
			
			this.domNode = this.srcNodeRef;
			this.domNode.style.display="inline-block";
			this.domNode.style.pointerEvents="none";
			this.domNode.style.lineHeight='0px';

			this._header = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" shape-rendering="geometric-precision">';
			this._header += '<g class="shapeg" pointer-events="auto">';
			this._footer = '</g></svg>';
		},

		/*
		 * Returns an ID that is unique in given doc.
		 * @param {object} doc Current document object
		 * @param {string} root Base string for unique ID name. Must conform to ID naming rules.
		 */
		_uniqueId: function(doc, root){
			var num = 0;
			var id;
			while(1){
				id=root+"_"+num;	
				if(!doc.getElementById(id)){
					break;
				}else{
					num++;
				}
			}
			return id;
		},
		
		startup: function(){
			this.resize();
			this._bboxStartup = this._bbox;
			var that = this;
			//FIXME: setTimeout hack to address possible timing problem
			//with loading of the shapes.css file, which might not be available
			//for the first shapes widget added to a document.
			setTimeout(function(){
				that.resize();
				that._bboxStartup = that._bbox;
			}, 1000);
		},

		resize: function(){
			this._resize();
		},

		_resize: function(){
			dojo.addClass(this.domNode,'shape');
			this.createGraphics();
			var gbbox = this._g.getBBox();
			
			// In some cases, bbox has zero size in both dimensions
			// in case where bbox width or height is zero.
			// For some cases, such as horiz or vert lines, this
			// is wrong, so need to adjust 
			if(this.adjustBBox_Widget){
				this.adjustBBox_Widget(gbbox);
			}
			
			var thisbbox = this._bbox;
			var x=gbbox.x, y=gbbox.y, w=gbbox.width, h=gbbox.height;
			this._bbox = gbbox;
			var strokewidth = dojo.style(this.domNode,'stroke-width');
			if(strokewidth<1){
				strokewidth = 1;
			}
			this._xoffset = this._yoffset = strokewidth;
			var double = strokewidth*2;
			
			/* Have to put a little padding around the SVG because
			 * no browsers take stroke-width into account when computing box sizes
			 * and Firefox will clip a pixel off of the stroke-width for zero-height
			 * horizontal lines.
			 */
			x -= this._xoffset;
			w += double;
			y -= this._yoffset;
			h += double;
			this._svgroot.setAttribute('viewBox',x+' '+y+' '+w+' '+h);
			this._svgroot.style.width = w+'px';
			this._svgroot.style.height = h+'px';
			this.domNode.style.width = w+'px';
			this.domNode.style.height = h+'px';
			this.domNode.style.display = 'inline-block';

		}
	});
});

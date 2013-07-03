define([
	"dojo/_base/declare",
	"dijit/_WidgetBase"
], function(declare, _WidgetBase){
			
	return declare("shapes._Shape", [_WidgetBase], {

		buildRendering: function(){
			this.inherited(arguments);
			
			this.domNode = this.srcNodeRef;
			var computedDisplay = dojo.style(this.domNode, 'display');
			if(computedDisplay != 'none' && computedDisplay != 'block' && computedDisplay != 'inline-block'){
				// force inline-block instead of just inline
				this.domNode.style.display = 'inline-block';
			}
			this.domNode.style.pointerEvents="none";
			this.domNode.style.lineHeight='0px';

			this._header = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" shape-rendering="geometric-precision">';
			this._header += '<g class="shapeg" pointer-events="all">';
			this._footer = '</g></svg>';
			
			this.subscribe('/maqetta/appstates/state/changed',function(){
				this.resize();
			}.bind(this));
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
			
			// In some scenarios, there is a possible timing problem
			//with loading of the shapes.css file, which might not be available
			//for the first shapes widget added to a document.
			var shapes_css_check = function(counter){
				var loaded = true;
				
				var checkForShapeCSS  = function(styleSheet){
					if(styleSheet.href && styleSheet.href.indexOf('shapes.css') >= 0 && styleSheet.cssRules && styleSheet.cssRules.length > 0){
						this.resize();
						this._bboxStartup = this._bbox;
						return true;
					}
					return false;
				}.bind(this);
				
				var styleSheets = this.domNode && this.domNode.ownerDocument && this.domNode.ownerDocument.styleSheets;
				if(!styleSheets){
					styleSheets = [];
				}
				
				shapeCssLoop:
				for(var ss=0; ss<styleSheets.length; ss++){
					var styleSheet = styleSheets[ss];
					if(loaded = checkForShapeCSS(styleSheet)){
						break shapeCssLoop;
					}
					if(styleSheet.cssRules){
						for(var r=0; r<styleSheet.cssRules.length; r++){
							var rule = styleSheet.cssRules[r];
							if(rule.type == 3 && rule.styleSheet){	// type==3 => @import
								if(loaded = checkForShapeCSS(rule.styleSheet)){
									break shapeCssLoop;
								}
							}
						}
					}
				}
				
				// Try again once every second for up to 10 tries
				if(!loaded && counter<10){
					setTimeout(function(counter){
						shapes_css_check(++counter)
					}.bind(this, counter), 1000);
				}
				
			}.bind(this);
			
			var counter = 0;
			shapes_css_check(counter);
		},
		
		resize: function(){
			this._resize();
		},

		_resize: function(){
			if(!this.domNode){
				return;
			}
			dojo.addClass(this.domNode,'shape');
			this.domNode.style.pointerEvents="none";
			this.domNode.style.lineHeight='0px';
			this.createGraphics();
			if(!this._isDisplayed(this._g)){
				return;
			}
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
			if(!this._bboxStartup){
				this._bboxStartup = this._bbox;
			}
			var strokewidth = dojo.style(this.domNode,'strokeWidth');
			if(strokewidth<1){
				strokewidth = 1;
			}
			this._xoffset = this._yoffset = strokewidth;
			var doubleStrokeWidth = strokewidth*2;
			
			/* Have to put a little padding around the SVG because
			 * no browsers take stroke-width into account when computing box sizes
			 * and Firefox will clip a pixel off of the stroke-width for zero-height
			 * horizontal lines.
			 */
			x -= this._xoffset;
			w += doubleStrokeWidth;
			y -= this._yoffset;
			h += doubleStrokeWidth;
			this._svgroot.setAttribute('viewBox',x+' '+y+' '+w+' '+h);
			this._svgroot.style.width = w+'px';
			this._svgroot.style.height = h+'px';
			this.domNode.style.width = w+'px';
			this.domNode.style.height = h+'px';
			var computedDisplay = dojo.style(this.domNode, 'display');
			if(computedDisplay != 'none' && computedDisplay != 'block' && computedDisplay != 'inline-block'){
				// force inline-block instead of just inline
				this.domNode.style.display = 'inline-block';
			}
		},
		
		_isDisplayed: function(node){
			if(!node || !node.ownerDocument || !node.ownerDocument.defaultView){
				// Shouldn't be here
				return false;
			}
			var win = node.ownerDocument.defaultView;
			var n = node;
			while(n && n.tagName != 'BODY'){
				var style = win.getComputedStyle(n, '');
				if(style.display == 'none'){
					return false;
				}
				n = n.parentNode;
			}
			return true;
		}
	});
});

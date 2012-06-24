define(["dojo/_base/lang", "dojo/_base/declare", "dojo/dom-geometry", "dijit/registry", "dijit/_WidgetBase", "dojo/_base/html", 
		"dojo/_base/event", "dojox/gfx", "dojox/widget/_Invalidating","./ScaleBase"],
	function(lang, declare, domGeom,  WidgetRegistry, _WidgetBase, html, event, gfx, _Invalidating, ScaleBase){
	
	/*=====
	var _WidgetBase = dijit._WidgetBase;
	var _Invalidating = dojox.widget._Invalidating;
	=====*/
	
	return declare("dojox.dgauges.GaugeBase", [_WidgetBase, _Invalidating], {
		//	summary: 
		//		This class is the base class for the circular and 
		//		rectangular (horizontal and vertical) gauge components.
		//		A gauge is a composition of elements added to the gauge using the addElement method.
		//		Elements are drawn from back to front in the same order they are added (using addElement).
		//		An elements can be: 
		//		- A GFX drawing functions typically used for defining the style of the gauge.
		//		- A scale: CircularScale or RectangularScale depending on the type of gauge.
		//		- A text, using the TextIndicator
		//		Note: Indicator classes (value indicators, range indicators) are sub-elements of scales
		//		
		//		To create a custom gauge, subclass CircularGauge or RectangularGauge and
		//		configure its elements in the constructor.
	
		//		Ready to use, predefined gauges are available in dojox.dgauges.components.
		//		They are good examples of gauges built on top of the framework.
		_elements: null,
		_scales: null,
		_elementsIndex: null,
		_elementsRenderers: null,
		_gfxGroup: null,
		_mouseShield: null,
		_widgetBox: null,
		_node: null,

		//	value: Number
		//		A convenient way for setting the value of the first indicator of the first
		//		scale declared in the gauge. It must be changed using the set method.
		//		For other indicators, you have to set their value explicitly.
		value: 0,
		
		//	font: Object
		//		The font of the gauge used by scales if not overridden.
		font: null,
		
		constructor: function(/* Object */args, /* DOMNode */ node){
			this._addGroupBoundingBoxSupport();
			this.font = {
				family: "Helvetica",
				style: "normal",
				variant: "small-caps",
				weight: "bold",
				size: "10pt",
				color: "black"
			};
			this._elements = [];
			this._scales = [];
			this._elementsIndex = {};
			this._elementsRenderers = {};
			this._node = WidgetRegistry.byId(node);
			var box = html.getMarginBox(node);

			this.surface = gfx.createSurface(this._node, box.w || 1, box.h || 1);
			this._widgetBox = box;
			// _baseGroup is a workaround for http://bugs.dojotoolkit.org/ticket/14471
			this._baseGroup = this.surface.createGroup();
			this._mouseShield = this._baseGroup.createGroup();
			this._gfxGroup = this._baseGroup.createGroup();
		},
		
		_setCursor: function(type){
			if(this._node)
				this._node.style.cursor = type;
		},
		
		_addGroupBoundingBoxSupport: function(){
		
			dojox.gfx.addRect = function( /*dojox.gfx.Rectangle*/a, /*dojox.gfx.Rectangle*/ b){
				//	returns:
				//		a rectangle representing the addition of the two given.
				if(a === null && b === null){
					return null;
				}
				if(a === null && b !== null){
					return b;
				}
				if(b === null){
					return a;
				}
				var single1 = Math.min(a.x, b.x);
				var single2 = Math.max(a.x + a.width, b.x + b.width);
				var single3 = Math.min(a.y, b.y);
				var single4 = Math.max(a.y + a.height, b.y + b.height);
				return {
					x: single1,
					y: single3,
					width: single2 - single1,
					height: single4 - single3
				};
			};
			
			dojo.extend(dojox.gfx.matrix.Matrix2D, {
				isIdentity: function(){
					// summary:
					//		Indicates whether this transform corresponds to the identity operation.
					return this.xy === 0 && this.yx === 0 && this.xx === 1 && this.yy === 1 && this.dx === 0 && this.dy === 0;
				},
				transformRectangle: function(/* dojox.gfx.Rectangle */rect){
					// summary:
					//		Applies the transformation to a rectangle.
					// description:
					//		The method applies the transformation on all corners of the
					//		rectangle and returns the smallest rectangle enclosing the 4 transformed
					//		points.
					rect = rect ||
					{
						x: 0,
						y: 0,
						width: 0,
						height: 0
					};
					if(this.isIdentity()){
						return {
							"x": rect.x,
							"y": rect.y,
							"width": rect.width,
							"height": rect.height
						};
					}
					var m = dojox.gfx.matrix;
					var p0 = m.multiplyPoint(this, rect.x, rect.y);
					var p1 = m.multiplyPoint(this, rect.x, rect.y + rect.height);
					var p2 = m.multiplyPoint(this, rect.x + rect.width, rect.y);
					var p3 = m.multiplyPoint(this, rect.x + rect.width, rect.y + rect.height);
					var minx = Math.min(p0.x, Math.min(p1.x, Math.min(p2.x, p3.x)));
					var miny = Math.min(p0.y, Math.min(p1.y, Math.min(p2.y, p3.y)));
					var maxx = Math.max(p0.x, Math.max(p1.x, Math.max(p2.x, p3.x)));
					var maxy = Math.max(p0.y, Math.max(p1.y, Math.max(p2.y, p3.y)));
					var r = {};
					r.x = minx;
					r.y = miny;
					r.width = maxx - minx;
					r.height = maxy - miny;
					return r;
				}
			});
			dojo.extend(dojox.gfx.Group, {
				getBoundingBox: function(){
					var bb = null;
					var cs = this.children;
					var ncs = this.children.length;
					var c;
					for(var i = 0; i < ncs; ++i){
						var c = cs[i];
						var cbb = c.getBoundingBox();
						if(!cbb){
							continue;
						}
						var ct = c.getTransform();
						if(ct && !ct.isIdentity()){
							cbb = ct.transformRectangle(cbb);
						}
						bb = bb ? dojox.gfx.addRect(bb, cbb) : cbb;
					}

					return bb;
				}
			})
		},
		
		_computeBoundingBox: function(/* Object */element){
			return element ? element.getBoundingBox() : {x:0, y:0, width:0, height:0};
		},
		
		destroy: function(){
			//	summary:
			//		Cleanup when a gauge is to be destroyed.
			
			this.surface.destroy();
		},

		resize: function(width, height){
			//	summary:
			//		Resize the gauge to the dimensions of width and height.
			//	description:
			//		Resize the gauge and its surface to the width and height dimensions.
			//		If no width/height or box is provided, resize the surface to the marginBox of the gauge.
			//	width: Number
			//		The new width of the gauge.
			//	height: Number
			//		The new height of the gauge.
			//	returns: dojox.dgauges.GaugeBase
			//		A reference to the current gauge for functional chaining.
			var box;
			switch(arguments.length){
				// case 0, do not resize the div, just the surface
				case 1:
					// argument, override node box
					box = lang.mixin({}, width);
					domGeom.setMarginBox(this._node, box);
					break;
				case 2:
					box = {w: width, h: height};
					// argument, override node box
					domGeom.setMarginBox(this._node, box);
					break;
			}
			// in all cases take back the computed box
			box = domGeom.getMarginBox(this._node);
			this._widgetBox = box;
			var d = this.surface.getDimensions();
			if(d.width != box.w || d.height != box.h){
				// and set it on the surface
				this.surface.setDimensions(box.w, box.h);
				this._mouseShield.clear();
				this._mouseShield.createRect({x:0,y:0,width:box.w,height:box.h}).setFill([0, 0, 0, 0]);
				return this.invalidateRendering();
			}else{
				return this;
			}
		},
		
		addElement: function(/* String */name, /* Object */ element){
			//	summary:
			//		Adds a element to the gauge.
			//	name: String
			//		The name of the element to be added.
			//	element: Object
			//		This parameter can be:
			//		- A function which takes on argument of type GFX Group and return null or a
			//		GFX element retrievable using the getElementRenderer() method.
			//		- A Scale instance, i.e. CircularScale or RectangularScale.
			//		- A TextIndicator instance.
			if(this._elementsIndex[name] && this._elementsIndex[name] != element){
				this.removeElement(name);
			}
			
			if(lang.isFunction(element)){
				var gfxHolder = {};
				lang.mixin(gfxHolder, new _Invalidating());
				gfxHolder._name = name;
				gfxHolder._gfxGroup = this._gfxGroup.createGroup();
				gfxHolder.width = 0;
				gfxHolder.height = 0;
				gfxHolder._isGFX = true;
				gfxHolder.refreshRendering = function(){
					gfxHolder._gfxGroup.clear();
					return element(gfxHolder._gfxGroup, gfxHolder.width, gfxHolder.height);
				};
				this._elements.push(gfxHolder);
				this._elementsIndex[name] = gfxHolder;
			}else{
				element._name = name;
				element._gfxGroup = this._gfxGroup.createGroup();
				element._gauge = this;
				this._elements.push(element);
				this._elementsIndex[name] = element;
				
				if(element instanceof ScaleBase){
					this._scales.push(element);
				}
			}
			return this.invalidateRendering();
		},
		
		removeElement: function(/* String */name){
			//	summary:
			//		Remove the element defined by name from the gauge.
			//	name: String
			//		The name of the element as defined using addElement.
			//	returns: Object
			//		A reference to the removed element.
			
			element = this._elementsIndex[name];
			
			if(element){
				element._gfxGroup.removeShape();
				var idx = this._elements.indexOf(element);
				this._elements.splice(idx, 1);
				
				if(element instanceof ScaleBase){
					var idxs = this._scales.indexOf(element);
					this._scales.splice(idxs, 1);
				}
				delete this._elementsIndex[name];
				delete this._elementsRenderers[name];
			}
			this.invalidateRendering();
			return element;
		},
		
		getElement: function(/* String */name){
			//	summary:
			//		Get the given element, by name.
			//	name: String
			//		The name of the element as defined using addElement.
			//	returns: Object
			//		The element.
			return this._elementsIndex[name];
		},
		
		getElementRenderer: function(/* String */name){
			//	summary:
			//		Get the given element renderer, by name.
			//	name: String
			//		The name of the element as defined using addElement.
			//	returns: Object
			//		The element renderer returned by the
			//		drawing function or by the refreshRendering() method
			//		in the case of framework classes.
			return this._elementsRenderers[name];
		},
		
		onStartEditing: function(event){
			// summary:
			//		Event dispatched on interaction beginning (keyboard, mouse or gesture).
		},
		
		onEndEditing: function(event){
			// summary:
			//		Event dispatched on interaction end (keyboard, mouse or gesture).
		}
	})
});

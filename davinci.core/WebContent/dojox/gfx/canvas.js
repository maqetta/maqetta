dojo.provide("dojox.gfx.canvas");

dojo.require("dojox.gfx._base");
dojo.require("dojox.gfx.shape");
dojo.require("dojox.gfx.path");
dojo.require("dojox.gfx.arc");
dojo.require("dojox.gfx.decompose");

dojo.experimental("dojox.gfx.canvas");

(function(){
	var d = dojo, g = dojox.gfx, gs = g.shape, ga = g.arc,
		m = g.matrix, mp = m.multiplyPoint, pi = Math.PI, twoPI = 2 * pi, halfPI = pi /2;

	d.extend(g.Shape, {
		_render: function(/* Object */ ctx){
			// summary: render the shape
			ctx.save();
			this._renderTransform(ctx);
			this._renderShape(ctx);
			this._renderFill(ctx, true);
			this._renderStroke(ctx, true);
			ctx.restore();
		},
		_renderTransform: function(/* Object */ ctx){
			if("canvasTransform" in this){
				var t = this.canvasTransform;
				ctx.translate(t.dx, t.dy);
				ctx.rotate(t.angle2);
				ctx.scale(t.sx, t.sy);
				ctx.rotate(t.angle1);
				// The future implementation when vendors catch up with the spec:
				// var t = this.matrix;
				// ctx.transform(t.xx, t.yx, t.xy, t.yy, t.dx, t.dy);
			}
		},
		_renderShape: function(/* Object */ ctx){
			// nothing
		},
		_renderFill: function(/* Object */ ctx, /* Boolean */ apply){
			if("canvasFill" in this){
				if("canvasFillImage" in this){
					this.canvasFill = ctx.createPattern(this.canvasFillImage, "repeat");
					delete this.canvasFillImage;
				}
				ctx.fillStyle = this.canvasFill;
				if(apply){ ctx.fill(); }
			}else{
				ctx.fillStyle = "rgba(0,0,0,0.0)";
			}
		},
		_renderStroke: function(/* Object */ ctx, /* Boolean */ apply){
			var s = this.strokeStyle;
			if(s){
				ctx.strokeStyle = s.color.toString();
				ctx.lineWidth = s.width;
				ctx.lineCap = s.cap;
				if(typeof s.join == "number"){
					ctx.lineJoin = "miter";
					ctx.miterLimit = s.join;
				}else{
					ctx.lineJoin = s.join;
				}
				if(apply){ ctx.stroke(); }
			}else if(!apply){
				ctx.strokeStyle = "rgba(0,0,0,0.0)";
			}
		},

		// events are not implemented
		getEventSource: function(){ return null; },
		connect:		function(){},
		disconnect:		function(){}
	});

	var modifyMethod = function(shape, method, extra){
			var old = shape.prototype[method];
			shape.prototype[method] = extra ?
				function(){
					this.surface.makeDirty();
					old.apply(this, arguments);
					extra.call(this);
					return this;
				} :
				function(){
					this.surface.makeDirty();
					return old.apply(this, arguments);
				};
		};

	modifyMethod(g.Shape, "setTransform",
		function(){
			// prepare Canvas-specific structures
			if(this.matrix){
				this.canvasTransform = g.decompose(this.matrix);
			}else{
				delete this.canvasTransform;
			}
		});

	modifyMethod(g.Shape, "setFill",
		function(){
			// prepare Canvas-specific structures
			var fs = this.fillStyle, f;
			if(fs){
				if(typeof(fs) == "object" && "type" in fs){
					var ctx = this.surface.rawNode.getContext("2d");
					switch(fs.type){
						case "linear":
						case "radial":
							f = fs.type == "linear" ?
								ctx.createLinearGradient(fs.x1, fs.y1, fs.x2, fs.y2) :
								ctx.createRadialGradient(fs.cx, fs.cy, 0, fs.cx, fs.cy, fs.r);
							d.forEach(fs.colors, function(step){
								f.addColorStop(step.offset, g.normalizeColor(step.color).toString());
							});
							break;
						case "pattern":
							var img = new Image(fs.width, fs.height);
							this.surface.downloadImage(img, fs.src);
							this.canvasFillImage = img;
					}
				}else{
					// Set fill color using CSS RGBA func style
					f = fs.toString();
				}
				this.canvasFill = f;
			}else{
				delete this.canvasFill;
			}
		});

	modifyMethod(g.Shape, "setStroke");
	modifyMethod(g.Shape, "setShape");

	dojo.declare("dojox.gfx.Group", g.Shape, {
		// summary: a group shape (Canvas), which can be used
		//	to logically group shapes (e.g, to propagate matricies)
		constructor: function(){
			gs.Container._init.call(this);
		},
		_render: function(/* Object */ ctx){
			// summary: render the group
			ctx.save();
			this._renderTransform(ctx);
			this._renderFill(ctx);
			this._renderStroke(ctx);
			for(var i = 0; i < this.children.length; ++i){
				this.children[i]._render(ctx);
			}
			ctx.restore();
		}
	});

	dojo.declare("dojox.gfx.Rect", gs.Rect, {
		// summary: a rectangle shape (Canvas)
		_renderShape: function(/* Object */ ctx){
			var s = this.shape, r = Math.min(s.r, s.height / 2, s.width / 2),
				xl = s.x, xr = xl + s.width, yt = s.y, yb = yt + s.height,
				xl2 = xl + r, xr2 = xr - r, yt2 = yt + r, yb2 = yb - r;
			ctx.beginPath();
			ctx.moveTo(xl2, yt);
			if(r){
				ctx.arc(xr2, yt2, r, -halfPI, 0, false);
				ctx.arc(xr2, yb2, r, 0, halfPI, false);
				ctx.arc(xl2, yb2, r, halfPI, pi, false);
				ctx.arc(xl2, yt2, r, pi, pi + halfPI, false);
			}else{
				ctx.lineTo(xr2, yt);
				ctx.lineTo(xr, yb2);
				ctx.lineTo(xl2, yb);
				ctx.lineTo(xl, yt2);
			}
	 		ctx.closePath();
		}
	});

	var bezierCircle = [];
	(function(){
		var u = ga.curvePI4;
		bezierCircle.push(u.s, u.c1, u.c2, u.e);
		for(var a = 45; a < 360; a += 45){
			var r = m.rotateg(a);
			bezierCircle.push(mp(r, u.c1), mp(r, u.c2), mp(r, u.e));
		}
	})();

	dojo.declare("dojox.gfx.Ellipse", gs.Ellipse, {
		// summary: an ellipse shape (Canvas)
		setShape: function(){
			g.Ellipse.superclass.setShape.apply(this, arguments);
			// prepare Canvas-specific structures
			var s = this.shape, t, c1, c2, r = [],
				M = m.normalize([m.translate(s.cx, s.cy), m.scale(s.rx, s.ry)]);
			t = mp(M, bezierCircle[0]);
			r.push([t.x, t.y]);
			for(var i = 1; i < bezierCircle.length; i += 3){
				c1 = mp(M, bezierCircle[i]);
				c2 = mp(M, bezierCircle[i + 1]);
				t  = mp(M, bezierCircle[i + 2]);
				r.push([c1.x, c1.y, c2.x, c2.y, t.x, t.y]);
			}
			this.canvasEllipse = r;
			return this;
		},
		_renderShape: function(/* Object */ ctx){
			var r = this.canvasEllipse;
			ctx.beginPath();
			ctx.moveTo.apply(ctx, r[0]);
			for(var i = 1; i < r.length; ++i){
				ctx.bezierCurveTo.apply(ctx, r[i]);
			}
			ctx.closePath();
		}
	});

	dojo.declare("dojox.gfx.Circle", gs.Circle, {
		// summary: a circle shape (Canvas)
		_renderShape: function(/* Object */ ctx){
			var s = this.shape;
			ctx.beginPath();
			ctx.arc(s.cx, s.cy, s.r, 0, twoPI, 1);
		}
	});

	dojo.declare("dojox.gfx.Line", gs.Line, {
		// summary: a line shape (Canvas)
		_renderShape: function(/* Object */ ctx){
			var s = this.shape;
			ctx.beginPath();
			ctx.moveTo(s.x1, s.y1);
			ctx.lineTo(s.x2, s.y2);
		}
	});

	dojo.declare("dojox.gfx.Polyline", gs.Polyline, {
		// summary: a polyline/polygon shape (Canvas)
		setShape: function(){
			g.Polyline.superclass.setShape.apply(this, arguments);
			// dojo.inherited("setShape", arguments);
			// prepare Canvas-specific structures
			var p = this.shape.points, f = p[0], r = [], c, i;
			if(p.length){
				if(typeof f == "number"){
					r.push(f, p[1]);
					i = 2;
				}else{
					r.push(f.x, f.y);
					i = 1;
				}
				for(; i < p.length; ++i){
					c = p[i];
					if(typeof c == "number"){
						r.push(c, p[++i]);
					}else{
						r.push(c.x, c.y);
					}
				}
			}
			this.canvasPolyline = r;
			return this;
		},
		_renderShape: function(/* Object */ ctx){
			// console.debug("Polyline::_renderShape");
			var p = this.canvasPolyline;
			if(p.length){
				ctx.beginPath();
				ctx.moveTo(p[0], p[1]);
				for(var i = 2; i < p.length; i += 2){
					ctx.lineTo(p[i], p[i + 1]);
				}
			}
		}
	});

	dojo.declare("dojox.gfx.Image", gs.Image, {
		// summary: an image shape (Canvas)
		setShape: function(){
			g.Image.superclass.setShape.apply(this, arguments);
			// prepare Canvas-specific structures
			var img = new Image();
			this.surface.downloadImage(img, this.shape.src);
			this.canvasImage = img;
			return this;
		},
		_renderShape: function(/* Object */ ctx){
			var s = this.shape;
			ctx.drawImage(this.canvasImage, s.x, s.y, s.width, s.height);
		}
	});

	dojo.declare("dojox.gfx.Text", gs.Text, {
		// summary: a text shape (Canvas)
		_renderShape: function(/* Object */ ctx){
			var s = this.shape;
			// nothing for the moment
		}
	});
	modifyMethod(g.Text, "setFont");

	var pathRenderers = {
		M: "_moveToA", m: "_moveToR",
		L: "_lineToA", l: "_lineToR",
		H: "_hLineToA", h: "_hLineToR",
		V: "_vLineToA", v: "_vLineToR",
		C: "_curveToA", c: "_curveToR",
		S: "_smoothCurveToA", s: "_smoothCurveToR",
		Q: "_qCurveToA", q: "_qCurveToR",
		T: "_qSmoothCurveToA", t: "_qSmoothCurveToR",
		A: "_arcTo", a: "_arcTo",
		Z: "_closePath", z: "_closePath"
	};

	dojo.declare("dojox.gfx.Path", g.path.Path, {
		// summary: a path shape (Canvas)
		constructor: function(){
			this.lastControl = {};
		},
		setShape: function(){
			this.canvasPath = [];
			return g.Path.superclass.setShape.apply(this, arguments);
		},
		_updateWithSegment: function(segment){
			var last = d.clone(this.last);
			this[pathRenderers[segment.action]](this.canvasPath, segment.action, segment.args);
			this.last = last;
			g.Path.superclass._updateWithSegment.apply(this, arguments);
		},
		_renderShape: function(/* Object */ ctx){
			var r = this.canvasPath;
			ctx.beginPath();
			for(var i = 0; i < r.length; i += 2){
				ctx[r[i]].apply(ctx, r[i + 1]);
			}
		},
		_moveToA: function(result, action, args){
			result.push("moveTo", [args[0], args[1]]);
			for(var i = 2; i < args.length; i += 2){
				result.push("lineTo", [args[i], args[i + 1]]);
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
			this.lastControl = {};
		},
		_moveToR: function(result, action, args){
			if("x" in this.last){
				result.push("moveTo", [this.last.x += args[0], this.last.y += args[1]]);
			}else{
				result.push("moveTo", [this.last.x = args[0], this.last.y = args[1]]);
			}
			for(var i = 2; i < args.length; i += 2){
				result.push("lineTo", [this.last.x += args[i], this.last.y += args[i + 1]]);
			}
			this.lastControl = {};
		},
		_lineToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 2){
				result.push("lineTo", [args[i], args[i + 1]]);
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
			this.lastControl = {};
		},
		_lineToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 2){
				result.push("lineTo", [this.last.x += args[i], this.last.y += args[i + 1]]);
			}
			this.lastControl = {};
		},
		_hLineToA: function(result, action, args){
			for(var i = 0; i < args.length; ++i){
				result.push("lineTo", [args[i], this.last.y]);
			}
			this.last.x = args[args.length - 1];
			this.lastControl = {};
		},
		_hLineToR: function(result, action, args){
			for(var i = 0; i < args.length; ++i){
				result.push("lineTo", [this.last.x += args[i], this.last.y]);
			}
			this.lastControl = {};
		},
		_vLineToA: function(result, action, args){
			for(var i = 0; i < args.length; ++i){
				result.push("lineTo", [this.last.x, args[i]]);
			}
			this.last.y = args[args.length - 1];
			this.lastControl = {};
		},
		_vLineToR: function(result, action, args){
			for(var i = 0; i < args.length; ++i){
				result.push("lineTo", [this.last.x, this.last.y += args[i]]);
			}
			this.lastControl = {};
		},
		_curveToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 6){
				result.push("bezierCurveTo", args.slice(i, i + 6));
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
			this.lastControl.x = args[args.length - 4];
			this.lastControl.y = args[args.length - 3];
			this.lastControl.type = "C";
		},
		_curveToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 6){
				result.push("bezierCurveTo", [
					this.last.x + args[i],
					this.last.y + args[i + 1],
					this.lastControl.x = this.last.x + args[i + 2],
					this.lastControl.y = this.last.y + args[i + 3],
					this.last.x + args[i + 4],
					this.last.y + args[i + 5]
				]);
				this.last.x += args[i + 4];
				this.last.y += args[i + 5];
			}
			this.lastControl.type = "C";
		},
		_smoothCurveToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 4){
				var valid = this.lastControl.type == "C";
				result.push("bezierCurveTo", [
					valid ? 2 * this.last.x - this.lastControl.x : this.last.x,
					valid ? 2 * this.last.y - this.lastControl.y : this.last.y,
					args[i],
					args[i + 1],
					args[i + 2],
					args[i + 3]
				]);
				this.lastControl.x = args[i];
				this.lastControl.y = args[i + 1];
				this.lastControl.type = "C";
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
		},
		_smoothCurveToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 4){
				var valid = this.lastControl.type == "C";
				result.push("bezierCurveTo", [
					valid ? 2 * this.last.x - this.lastControl.x : this.last.x,
					valid ? 2 * this.last.y - this.lastControl.y : this.last.y,
					this.last.x + args[i],
					this.last.y + args[i + 1],
					this.last.x + args[i + 2],
					this.last.y + args[i + 3]
				]);
				this.lastControl.x = this.last.x + args[i];
				this.lastControl.y = this.last.y + args[i + 1];
				this.lastControl.type = "C";
				this.last.x += args[i + 2];
				this.last.y += args[i + 3];
			}
		},
		_qCurveToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 4){
				result.push("quadraticCurveTo", args.slice(i, i + 4));
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
			this.lastControl.x = args[args.length - 4];
			this.lastControl.y = args[args.length - 3];
			this.lastControl.type = "Q";
		},
		_qCurveToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 4){
				result.push("quadraticCurveTo", [
					this.lastControl.x = this.last.x + args[i],
					this.lastControl.y = this.last.y + args[i + 1],
					this.last.x + args[i + 2],
					this.last.y + args[i + 3]
				]);
				this.last.x += args[i + 2];
				this.last.y += args[i + 3];
			}
			this.lastControl.type = "Q";
		},
		_qSmoothCurveToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 2){
				var valid = this.lastControl.type == "Q";
				result.push("quadraticCurveTo", [
					this.lastControl.x = valid ? 2 * this.last.x - this.lastControl.x : this.last.x,
					this.lastControl.y = valid ? 2 * this.last.y - this.lastControl.y : this.last.y,
					args[i],
					args[i + 1]
				]);
				this.lastControl.type = "Q";
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
		},
		_qSmoothCurveToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 2){
				var valid = this.lastControl.type == "Q";
				result.push("quadraticCurveTo", [
					this.lastControl.x = valid ? 2 * this.last.x - this.lastControl.x : this.last.x,
					this.lastControl.y = valid ? 2 * this.last.y - this.lastControl.y : this.last.y,
					this.last.x + args[i],
					this.last.y + args[i + 1]
				]);
				this.lastControl.type = "Q";
				this.last.x += args[i];
				this.last.y += args[i + 1];
			}
		},
		_arcTo: function(result, action, args){
			var relative = action == "a";
			for(var i = 0; i < args.length; i += 7){
				var x1 = args[i + 5], y1 = args[i + 6];
				if(relative){
					x1 += this.last.x;
					y1 += this.last.y;
				}
				var arcs = ga.arcAsBezier(
					this.last, args[i], args[i + 1], args[i + 2],
					args[i + 3] ? 1 : 0, args[i + 4] ? 1 : 0,
					x1, y1
				);
				d.forEach(arcs, function(p){
					result.push("bezierCurveTo", p);
				});
				this.last.x = x1;
				this.last.y = y1;
			}
			this.lastControl = {};
		},
		_closePath: function(result, action, args){
			result.push("closePath", []);
			this.lastControl = {};
		}
	});
	d.forEach(["moveTo", "lineTo", "hLineTo", "vLineTo", "curveTo",
		"smoothCurveTo", "qCurveTo", "qSmoothCurveTo", "arcTo", "closePath"],
		function(method){ modifyMethod(g.Path, method); }
	);

	dojo.declare("dojox.gfx.TextPath", g.path.TextPath, {
		// summary: a text shape (Canvas)
		_renderShape: function(/* Object */ ctx){
			var s = this.shape;
			// nothing for the moment
		}
	});

	dojo.declare("dojox.gfx.Surface", gs.Surface, {
		// summary: a surface object to be used for drawings (Canvas)
		constructor: function(){
			gs.Container._init.call(this);
			this.pendingImageCount = 0;
			this.makeDirty();
		},
		setDimensions: function(width, height){
			// summary: sets the width and height of the rawNode
			// width: String: width of surface, e.g., "100px"
			// height: String: height of surface, e.g., "100px"
			this.width  = g.normalizedLength(width);	// in pixels
			this.height = g.normalizedLength(height);	// in pixels
			if(!this.rawNode) return this;
			this.rawNode.width = width;
			this.rawNode.height = height;
			this.makeDirty();
			return this;	// self
		},
		getDimensions: function(){
			// summary: returns an object with properties "width" and "height"
			return this.rawNode ? {width:  this.rawNode.width, height: this.rawNode.height} : null;	// Object
		},
		_render: function(){
			// summary: render the all shapes
			if(this.pendingImageCount){ return; }
			var ctx = this.rawNode.getContext("2d");
			ctx.save();
			ctx.clearRect(0, 0, this.rawNode.width, this.rawNode.height);
			for(var i = 0; i < this.children.length; ++i){
				this.children[i]._render(ctx);
			}
			ctx.restore();
			if("pendingRender" in this){
				clearTimeout(this.pendingRender);
				delete this.pendingRender;
			}
		},
		makeDirty: function(){
			// summary: internal method, which is called when we may need to redraw
			if(!this.pendingImagesCount && !("pendingRender" in this)){
				this.pendingRender = setTimeout(d.hitch(this, this._render), 0);
			}
		},
		downloadImage: function(img, url){
			// summary:
			//		internal method, which starts an image download and renders, when it is ready
			// img: Image:
			//		the image object
			// url: String:
			//		the url of the image
			var handler = d.hitch(this, this.onImageLoad);
			if(!this.pendingImageCount++ && "pendingRender" in this){
				clearTimeout(this.pendingRender);
				delete this.pendingRender;
			}
			img.onload  = handler;
			img.onerror = handler;
			img.onabort = handler;
			img.src = url;
		},
		onImageLoad: function(){
			if(!--this.pendingImageCount){ this._render(); }
		},

		// events are not implemented
		getEventSource: function(){ return null; },
		connect:		function(){},
		disconnect:		function(){}
	});

	g.createSurface = function(parentNode, width, height){
		// summary: creates a surface (Canvas)
		// parentNode: Node: a parent node
		// width: String: width of surface, e.g., "100px"
		// height: String: height of surface, e.g., "100px"

		if(!width && !height){
			var pos = d.position(parentNode);
			width  = width  || pos.w;
			height = height || pos.h;
		}
		if(typeof width == "number"){
			width = width + "px";
		}
		if(typeof height == "number"){
			height = height + "px";
		}

		var s = new g.Surface(),
			p = d.byId(parentNode),
			c = p.ownerDocument.createElement("canvas");

		c.width  = dojox.gfx.normalizedLength(width);	// in pixels
		c.height = dojox.gfx.normalizedLength(height);	// in pixels

		p.appendChild(c);
		s.rawNode = c;
		s._parent = p;
		s.surface = s;
		return s;	// dojox.gfx.Surface
	};

	// Extenders

	var C = gs.Container, Container = {
		add: function(shape){
			this.surface.makeDirty();
			return C.add.apply(this, arguments);
		},
		remove: function(shape, silently){
			this.surface.makeDirty();
			return C.remove.apply(this, arguments);
		},
		clear: function(){
			this.surface.makeDirty();
			return C.clear.apply(this, arguments);
		},
		_moveChildToFront: function(shape){
			this.surface.makeDirty();
			return C._moveChildToFront.apply(this, arguments);
		},
		_moveChildToBack: function(shape){
			this.surface.makeDirty();
			return C._moveChildToBack.apply(this, arguments);
		}
	};

	d.mixin(gs.Creator, {
		// summary: Canvas shape creators
		createObject: function(shapeType, rawShape) {
			// summary: creates an instance of the passed shapeType class
			// shapeType: Function: a class constructor to create an instance of
			// rawShape: Object: properties to be passed in to the classes "setShape" method
			// overrideSize: Boolean: set the size explicitly, if true
			var shape = new shapeType();
			shape.surface = this.surface;
			shape.setShape(rawShape);
			this.add(shape);
			return shape;	// dojox.gfx.Shape
		}
	});

	d.extend(g.Group, Container);
	d.extend(g.Group, gs.Creator);

	d.extend(g.Surface, Container);
	d.extend(g.Surface, gs.Creator);
})();

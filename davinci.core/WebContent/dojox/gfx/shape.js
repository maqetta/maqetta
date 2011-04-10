dojo.provide("dojox.gfx.shape");

dojo.require("dojox.gfx._base");

dojo.declare("dojox.gfx.Shape", null, {
	// summary: a Shape object, which knows how to apply
	// graphical attributes and transformations

	constructor: function(){
		// rawNode: Node: underlying node
		this.rawNode = null;

		// shape: Object: an abstract shape object
		//	(see dojox.gfx.defaultPath,
		//	dojox.gfx.defaultPolyline,
		//	dojox.gfx.defaultRect,
		//	dojox.gfx.defaultEllipse,
		//	dojox.gfx.defaultCircle,
		//	dojox.gfx.defaultLine,
		//	or dojox.gfx.defaultImage)
		this.shape = null;

		// matrix: dojox.gfx.Matrix2D: a transformation matrix
		this.matrix = null;

		// fillStyle: Object: a fill object
		//	(see dojox.gfx.defaultLinearGradient,
		//	dojox.gfx.defaultRadialGradient,
		//	dojox.gfx.defaultPattern,
		//	or dojo.Color)
		this.fillStyle = null;

		// strokeStyle: Object: a stroke object
		//	(see dojox.gfx.defaultStroke)
		this.strokeStyle = null;

		// bbox: dojox.gfx.Rectangle: a bounding box of this shape
		//	(see dojox.gfx.defaultRect)
		this.bbox = null;

		// virtual group structure

		// parent: Object: a parent or null
		//	(see dojox.gfx.Surface,
		//	dojox.gfx.shape.VirtualGroup,
		//	or dojox.gfx.Group)
		this.parent = null;

		// parentMatrix: dojox.gfx.Matrix2D
		//	a transformation matrix inherited from the parent
		this.parentMatrix = null;
	},

	// trivial getters

	getNode: function(){
		// summary: returns the current DOM Node or null
		return this.rawNode; // Node
	},
	getShape: function(){
		// summary: returns the current shape object or null
		//	(see dojox.gfx.defaultPath,
		//	dojox.gfx.defaultPolyline,
		//	dojox.gfx.defaultRect,
		//	dojox.gfx.defaultEllipse,
		//	dojox.gfx.defaultCircle,
		//	dojox.gfx.defaultLine,
		//	or dojox.gfx.defaultImage)
		return this.shape; // Object
	},
	getTransform: function(){
		// summary: returns the current transformation matrix or null
		return this.matrix;	// dojox.gfx.Matrix2D
	},
	getFill: function(){
		// summary: returns the current fill object or null
		//	(see dojox.gfx.defaultLinearGradient,
		//	dojox.gfx.defaultRadialGradient,
		//	dojox.gfx.defaultPattern,
		//	or dojo.Color)
		return this.fillStyle;	// Object
	},
	getStroke: function(){
		// summary: returns the current stroke object or null
		//	(see dojox.gfx.defaultStroke)
		return this.strokeStyle;	// Object
	},
	getParent: function(){
		// summary: returns the parent or null
		//	(see dojox.gfx.Surface,
		//	dojox.gfx.shape.VirtualGroup,
		//	or dojox.gfx.Group)
		return this.parent;	// Object
	},
	getBoundingBox: function(){
		// summary: returns the bounding box or null
		//	(see dojox.gfx.defaultRect)
		return this.bbox;	// dojox.gfx.Rectangle
	},
	getTransformedBoundingBox: function(){
		// summary: returns an array of four points or null
		//	four points represent four corners of the untransformed bounding box
		var b = this.getBoundingBox();
		if(!b){
			return null;	// null
		}
		var m = this._getRealMatrix();
			gm = dojox.gfx.matrix;
		return [	// Array
				gm.multiplyPoint(m, b.x, b.y),
				gm.multiplyPoint(m, b.x + b.width, b.y),
				gm.multiplyPoint(m, b.x + b.width, b.y + b.height),
				gm.multiplyPoint(m, b.x, b.y + b.height)
			];
	},
	getEventSource: function(){
		// summary: returns a Node, which is used as
		//	a source of events for this shape

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!

		return this.rawNode;	// Node
	},

	// empty settings

	setShape: function(shape){
		// summary: sets a shape object
		//	(the default implementation simply ignores it)
		// shape: Object: a shape object
		//	(see dojox.gfx.defaultPath,
		//	dojox.gfx.defaultPolyline,
		//	dojox.gfx.defaultRect,
		//	dojox.gfx.defaultEllipse,
		//	dojox.gfx.defaultCircle,
		//	dojox.gfx.defaultLine,
		//	or dojox.gfx.defaultImage)

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!

		this.shape = dojox.gfx.makeParameters(this.shape, shape);
		this.bbox = null;
		return this;	// self
	},
	setFill: function(fill){
		// summary: sets a fill object
		//	(the default implementation simply ignores it)
		// fill: Object: a fill object
		//	(see dojox.gfx.defaultLinearGradient,
		//	dojox.gfx.defaultRadialGradient,
		//	dojox.gfx.defaultPattern,
		//	or dojo.Color)

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!

		if(!fill){
			// don't fill
			this.fillStyle = null;
			return this;	// self
		}
		var f = null;
		if(typeof(fill) == "object" && "type" in fill){
			// gradient or pattern
			switch(fill.type){
				case "linear":
					f = dojox.gfx.makeParameters(dojox.gfx.defaultLinearGradient, fill);
					break;
				case "radial":
					f = dojox.gfx.makeParameters(dojox.gfx.defaultRadialGradient, fill);
					break;
				case "pattern":
					f = dojox.gfx.makeParameters(dojox.gfx.defaultPattern, fill);
					break;
			}
		}else{
			// color object
			f = dojox.gfx.normalizeColor(fill);
		}
		this.fillStyle = f;
		return this;	// self
	},
	setStroke: function(stroke){
		// summary: sets a stroke object
		//	(the default implementation simply ignores it)
		// stroke: Object: a stroke object
		//	(see dojox.gfx.defaultStroke)

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!

		if(!stroke){
			// don't stroke
			this.strokeStyle = null;
			return this;	// self
		}
		// normalize the stroke
		if(typeof stroke == "string" || dojo.isArray(stroke) || stroke instanceof dojo.Color){
			stroke = {color: stroke};
		}
		var s = this.strokeStyle = dojox.gfx.makeParameters(dojox.gfx.defaultStroke, stroke);
		s.color = dojox.gfx.normalizeColor(s.color);
		return this;	// self
	},
	setTransform: function(matrix){
		// summary: sets a transformation matrix
		// matrix: dojox.gfx.Matrix2D: a matrix or a matrix-like object
		//	(see an argument of dojox.gfx.Matrix2D
		//	constructor for a list of acceptable arguments)

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!

		this.matrix = dojox.gfx.matrix.clone(matrix ? dojox.gfx.matrix.normalize(matrix) : dojox.gfx.matrix.identity);
		return this._applyTransform();	// self
	},

	_applyTransform: function(){
		// summary: physically sets a matrix

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!

		return this;	// self
	},

	// z-index

	moveToFront: function(){
		// summary: moves a shape to front of its parent's list of shapes
		var p = this.getParent();
		if(p){
			p._moveChildToFront(this);
			this._moveToFront();	// execute renderer-specific action
		}
		return this;	// self
	},
	moveToBack: function(){
		// summary: moves a shape to back of its parent's list of shapes
		var p = this.getParent();
		if(p){
			p._moveChildToBack(this);
			this._moveToBack();	// execute renderer-specific action
		}
		return this;
	},
	_moveToFront: function(){
		// summary: renderer-specific hook, see dojox.gfx.shape.Shape.moveToFront()

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!
	},
	_moveToBack: function(){
		// summary: renderer-specific hook, see dojox.gfx.shape.Shape.moveToFront()

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!
	},

	// apply left & right transformation

	applyRightTransform: function(matrix){
		// summary: multiplies the existing matrix with an argument on right side
		//	(this.matrix * matrix)
		// matrix: dojox.gfx.Matrix2D: a matrix or a matrix-like object
		//	(see an argument of dojox.gfx.Matrix2D
		//	constructor for a list of acceptable arguments)
		return matrix ? this.setTransform([this.matrix, matrix]) : this;	// self
	},
	applyLeftTransform: function(matrix){
		// summary: multiplies the existing matrix with an argument on left side
		//	(matrix * this.matrix)
		// matrix: dojox.gfx.Matrix2D: a matrix or a matrix-like object
		//	(see an argument of dojox.gfx.Matrix2D
		//	constructor for a list of acceptable arguments)
		return matrix ? this.setTransform([matrix, this.matrix]) : this;	// self
	},
	applyTransform: function(matrix){
		// summary: a shortcut for dojox.gfx.Shape.applyRightTransform
		// matrix: dojox.gfx.Matrix2D: a matrix or a matrix-like object
		//	(see an argument of dojox.gfx.Matrix2D
		//	constructor for a list of acceptable arguments)
		return matrix ? this.setTransform([this.matrix, matrix]) : this;	// self
	},

	// virtual group methods

	removeShape: function(silently){
		// summary: removes the shape from its parent's list of shapes
		// silently: Boolean?: if true, do not redraw a picture yet
		if(this.parent){
			this.parent.remove(this, silently);
		}
		return this;	// self
	},
	_setParent: function(parent, matrix){
		// summary: sets a parent
		// parent: Object: a parent or null
		//	(see dojox.gfx.Surface,
		//	dojox.gfx.shape.VirtualGroup,
		//	or dojox.gfx.Group)
		// matrix: dojox.gfx.Matrix2D:
		//	a 2D matrix or a matrix-like object
		this.parent = parent;
		return this._updateParentMatrix(matrix);	// self
	},
	_updateParentMatrix: function(matrix){
		// summary: updates the parent matrix with new matrix
		// matrix: dojox.gfx.Matrix2D:
		//	a 2D matrix or a matrix-like object
		this.parentMatrix = matrix ? dojox.gfx.matrix.clone(matrix) : null;
		return this._applyTransform();	// self
	},
	_getRealMatrix: function(){
		// summary: returns the cumulative ("real") transformation matrix
		//	by combining the shape's matrix with its parent's matrix
		var m = this.matrix;
		var p = this.parent;
		while(p){
			if(p.matrix){
				m = dojox.gfx.matrix.multiply(p.matrix, m);
			}
			p = p.parent;
		}
		return m;	// dojox.gfx.Matrix2D
	}
});

dojox.gfx.shape._eventsProcessing = {
	connect: function(name, object, method){
		// summary: connects a handler to an event on this shape

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!

		return arguments.length > 2 ?	// Object
			dojo.connect(this.getEventSource(), name, object, method) :
			dojo.connect(this.getEventSource(), name, object);
	},
	disconnect: function(token){
		// summary: connects a handler by token from an event on this shape

		// COULD BE RE-IMPLEMENTED BY THE RENDERER!

		dojo.disconnect(token);
	}
};

dojo.extend(dojox.gfx.Shape, dojox.gfx.shape._eventsProcessing);

dojox.gfx.shape.Container = {
	// summary: a container of shapes, which can be used
	//	as a foundation for renderer-specific groups, or as a way
	//	to logically group shapes (e.g, to propagate matricies)

	_init: function() {
		// children: Array: a list of children
		this.children = [];
	},

	// group management

	openBatch: function() {
		// summary: starts a new batch, subsequent new child shapes will be held in
		//	the batch instead of appending to the container directly
	},
	closeBatch: function() {
		// summary: submits the current batch, append all pending child shapes to DOM
	},
	add: function(shape){
		// summary: adds a shape to the list
		// shape: dojox.gfx.Shape: a shape
		var oldParent = shape.getParent();
		if(oldParent){
			oldParent.remove(shape, true);
		}
		this.children.push(shape);
		return shape._setParent(this, this._getRealMatrix());	// self
	},
	remove: function(shape, silently){
		// summary: removes a shape from the list
		// silently: Boolean?: if true, do not redraw a picture yet
		for(var i = 0; i < this.children.length; ++i){
			if(this.children[i] == shape){
				if(silently){
					// skip for now
				}else{
					shape.parent = null;
					shape.parentMatrix = null;
				}
				this.children.splice(i, 1);
				break;
			}
		}
		return this;	// self
	},
	clear: function(){
		// summary: removes all shapes from a group/surface
		this.children = [];
		return this;	// self
	},

	// moving child nodes

	_moveChildToFront: function(shape){
		// summary: moves a shape to front of the list of shapes
		for(var i = 0; i < this.children.length; ++i){
			if(this.children[i] == shape){
				this.children.splice(i, 1);
				this.children.push(shape);
				break;
			}
		}
		return this;	// self
	},
	_moveChildToBack: function(shape){
		// summary: moves a shape to back of the list of shapes
		for(var i = 0; i < this.children.length; ++i){
			if(this.children[i] == shape){
				this.children.splice(i, 1);
				this.children.unshift(shape);
				break;
			}
		}
		return this;	// self
	}
};

dojo.declare("dojox.gfx.shape.Surface", null, {
	// summary: a surface object to be used for drawings
	constructor: function(){
		// underlying node
		this.rawNode = null;
		// the parent node
		this._parent = null;
		// the list of DOM nodes to be deleted in the case of destruction
		this._nodes = [];
		// the list of events to be detached in the case of destruction
		this._events = [];
	},
	destroy: function(){
		// summary: destroy all relevant external resources and release all
		//	external references to make this object garbage-collectible
		dojo.forEach(this._nodes, dojo.destroy);
		this._nodes = [];
		dojo.forEach(this._events, dojo.disconnect);
		this._events = [];
		this.rawNode = null;	// recycle it in _nodes, if it needs to be recycled
		if(dojo.isIE){
			while(this._parent.lastChild){
				dojo.destroy(this._parent.lastChild);
			}
		}else{
			this._parent.innerHTML = "";
		}
		this._parent = null;
	},
	getEventSource: function(){
		// summary: returns a node, which can be used to attach event listeners
		return this.rawNode; // Node
	},
	_getRealMatrix: function(){
		// summary: always returns the identity matrix
		return null;	// dojox.gfx.Matrix2D
	},
	isLoaded: true,
	onLoad: function(/*dojox.gfx.Surface*/ surface){
		// summary: local event, fired once when the surface is created
		// asynchronously, used only when isLoaded is false, required
		// only for Silverlight.
	},
	whenLoaded: function(
		/*Object?*/ context,
		/*Function|String*/ method
	){
		var f = dojo.hitch(context, method);
		if(this.isLoaded){
			f(this);
		}else{
			var h = dojo.connect(this, "onLoad", function(surface){
				dojo.disconnect(h);
				f(surface);
			});
		}
	}
});

dojo.extend(dojox.gfx.shape.Surface, dojox.gfx.shape._eventsProcessing);

dojo.declare("dojox.gfx.Point", null, {
	// summary: a hypothetical 2D point to be used for drawings - {x, y}
	// description: This object is defined for documentation purposes.
	//	You should use the naked object instead: {x: 1, y: 2}.
});

dojo.declare("dojox.gfx.Rectangle", null, {
	// summary: a hypothetical rectangle - {x, y, width, height}
	// description: This object is defined for documentation purposes.
	//	You should use the naked object instead: {x: 1, y: 2, width: 100, height: 200}.
});

dojo.declare("dojox.gfx.shape.Rect", dojox.gfx.Shape, {
	// summary: a generic rectangle
	constructor: function(rawNode){
		// rawNode: Node: a DOM Node
		this.shape = dojox.gfx.getDefault("Rect");
		this.rawNode = rawNode;
	},
	getBoundingBox: function(){
		// summary: returns the bounding box (its shape in this case)
		return this.shape;	// dojox.gfx.Rectangle
	}
});

dojo.declare("dojox.gfx.shape.Ellipse", dojox.gfx.Shape, {
	// summary: a generic ellipse
	constructor: function(rawNode){
		// rawNode: Node: a DOM Node
		this.shape = dojox.gfx.getDefault("Ellipse");
		this.rawNode = rawNode;
	},
	getBoundingBox: function(){
		// summary: returns the bounding box
		if(!this.bbox){
			var shape = this.shape;
			this.bbox = {x: shape.cx - shape.rx, y: shape.cy - shape.ry,
				width: 2 * shape.rx, height: 2 * shape.ry};
		}
		return this.bbox;	// dojox.gfx.Rectangle
	}
});

dojo.declare("dojox.gfx.shape.Circle", dojox.gfx.Shape, {
	// summary: a generic circle
	//	(this is a helper object, which is defined for convenience)
	constructor: function(rawNode){
		// rawNode: Node: a DOM Node
		this.shape = dojox.gfx.getDefault("Circle");
		this.rawNode = rawNode;
	},
	getBoundingBox: function(){
		// summary: returns the bounding box
		if(!this.bbox){
			var shape = this.shape;
			this.bbox = {x: shape.cx - shape.r, y: shape.cy - shape.r,
				width: 2 * shape.r, height: 2 * shape.r};
		}
		return this.bbox;	// dojox.gfx.Rectangle
	}
});

dojo.declare("dojox.gfx.shape.Line", dojox.gfx.Shape, {
	// summary: a generic line
	//	(this is a helper object, which is defined for convenience)
	constructor: function(rawNode){
		// rawNode: Node: a DOM Node
		this.shape = dojox.gfx.getDefault("Line");
		this.rawNode = rawNode;
	},
	getBoundingBox: function(){
		// summary: returns the bounding box
		if(!this.bbox){
			var shape = this.shape;
			this.bbox = {
				x:		Math.min(shape.x1, shape.x2),
				y:		Math.min(shape.y1, shape.y2),
				width:	Math.abs(shape.x2 - shape.x1),
				height:	Math.abs(shape.y2 - shape.y1)
			};
		}
		return this.bbox;	// dojox.gfx.Rectangle
	}
});

dojo.declare("dojox.gfx.shape.Polyline", dojox.gfx.Shape, {
	// summary: a generic polyline/polygon
	//	(this is a helper object, which is defined for convenience)
	constructor: function(rawNode){
		// rawNode: Node: a DOM Node
		this.shape = dojox.gfx.getDefault("Polyline");
		this.rawNode = rawNode;
	},
	setShape: function(points, closed){
		// summary: sets a polyline/polygon shape object
		// points: Object: a polyline/polygon shape object
		// closed: Boolean: close the polyline to make a polygon
		if(points && points instanceof Array){
			// points: Array: an array of points
			dojox.gfx.Shape.prototype.setShape.call(this, {points: points});
			if(closed && this.shape.points.length){
				this.shape.points.push(this.shape.points[0]);
			}
		}else{
			dojox.gfx.Shape.prototype.setShape.call(this, points);
		}
		return this;	// self
	},
	_normalizePoints: function(){
		// summary: normalize points to array of {x:number, y:number}
		var p = this.shape.points, l = p && p.length;
		if(l && typeof p[0] == "number"){
			var points = [];
			for(var i = 0; i < l; i += 2){
				points.push({x: p[i], y: p[i + 1]});
			}
			this.shape.points = points;
		}
	},
	getBoundingBox: function(){
		// summary: returns the bounding box
		if(!this.bbox && this.shape.points.length){
			var p = this.shape.points;
			var l = p.length;
			var t = p[0];
			var bbox = {l: t.x, t: t.y, r: t.x, b: t.y};
			for(var i = 1; i < l; ++i){
				t = p[i];
				if(bbox.l > t.x) bbox.l = t.x;
				if(bbox.r < t.x) bbox.r = t.x;
				if(bbox.t > t.y) bbox.t = t.y;
				if(bbox.b < t.y) bbox.b = t.y;
			}
			this.bbox = {
				x:		bbox.l,
				y:		bbox.t,
				width:	bbox.r - bbox.l,
				height:	bbox.b - bbox.t
			};
		}
		return this.bbox;	// dojox.gfx.Rectangle
	}
});

dojo.declare("dojox.gfx.shape.Image", dojox.gfx.Shape, {
	// summary: a generic image
	//	(this is a helper object, which is defined for convenience)
	constructor: function(rawNode){
		// rawNode: Node: a DOM Node
		this.shape = dojox.gfx.getDefault("Image");
		this.rawNode = rawNode;
	},
	getBoundingBox: function(){
		// summary: returns the bounding box (its shape in this case)
		return this.shape;	// dojox.gfx.Rectangle
	},
	setStroke: function(){
		// summary: ignore setting a stroke style
		return this;	// self
	},
	setFill: function(){
		// summary: ignore setting a fill style
		return this;	// self
	}
});

dojo.declare("dojox.gfx.shape.Text", dojox.gfx.Shape, {
	// summary: a generic text
	constructor: function(rawNode){
		// rawNode: Node: a DOM Node
		this.fontStyle = null;
		this.shape = dojox.gfx.getDefault("Text");
		this.rawNode = rawNode;
	},
	getFont: function(){
		// summary: returns the current font object or null
		return this.fontStyle;	// Object
	},
	setFont: function(newFont){
		// summary: sets a font for text
		// newFont: Object: a font object (see dojox.gfx.defaultFont) or a font string
		this.fontStyle = typeof newFont == "string" ? dojox.gfx.splitFontString(newFont) :
			dojox.gfx.makeParameters(dojox.gfx.defaultFont, newFont);
		this._setFont();
		return this;	// self
	}
});

dojox.gfx.shape.Creator = {
	// summary: shape creators
	createShape: function(shape){
		// summary: creates a shape object based on its type; it is meant to be used
		//	by group-like objects
		// shape: Object: a shape descriptor object
		var gfx = dojox.gfx;
		switch(shape.type){
			case gfx.defaultPath.type:		return this.createPath(shape);
			case gfx.defaultRect.type:		return this.createRect(shape);
			case gfx.defaultCircle.type:		return this.createCircle(shape);
			case gfx.defaultEllipse.type:		return this.createEllipse(shape);
			case gfx.defaultLine.type:		return this.createLine(shape);
			case gfx.defaultPolyline.type:	return this.createPolyline(shape);
			case gfx.defaultImage.type:		return this.createImage(shape);
			case gfx.defaultText.type:		return this.createText(shape);
			case gfx.defaultTextPath.type:	return this.createTextPath(shape);
		}
		return null;
	},
	createGroup: function(){
		// summary: creates a group shape
		return this.createObject(dojox.gfx.Group);	// dojox.gfx.Group
	},
	createRect: function(rect){
		// summary: creates a rectangle shape
		// rect: Object: a path object (see dojox.gfx.defaultRect)
		return this.createObject(dojox.gfx.Rect, rect);	// dojox.gfx.Rect
	},
	createEllipse: function(ellipse){
		// summary: creates an ellipse shape
		// ellipse: Object: an ellipse object (see dojox.gfx.defaultEllipse)
		return this.createObject(dojox.gfx.Ellipse, ellipse);	// dojox.gfx.Ellipse
	},
	createCircle: function(circle){
		// summary: creates a circle shape
		// circle: Object: a circle object (see dojox.gfx.defaultCircle)
		return this.createObject(dojox.gfx.Circle, circle);	// dojox.gfx.Circle
	},
	createLine: function(line){
		// summary: creates a line shape
		// line: Object: a line object (see dojox.gfx.defaultLine)
		return this.createObject(dojox.gfx.Line, line);	// dojox.gfx.Line
	},
	createPolyline: function(points){
		// summary: creates a polyline/polygon shape
		// points: Object: a points object (see dojox.gfx.defaultPolyline)
		//	or an Array of points
		return this.createObject(dojox.gfx.Polyline, points);	// dojox.gfx.Polyline
	},
	createImage: function(image){
		// summary: creates a image shape
		// image: Object: an image object (see dojox.gfx.defaultImage)
		return this.createObject(dojox.gfx.Image, image);	// dojox.gfx.Image
	},
	createText: function(text){
		// summary: creates a text shape
		// text: Object: a text object (see dojox.gfx.defaultText)
		return this.createObject(dojox.gfx.Text, text);	// dojox.gfx.Text
	},
	createPath: function(path){
		// summary: creates a path shape
		// path: Object: a path object (see dojox.gfx.defaultPath)
		return this.createObject(dojox.gfx.Path, path);	// dojox.gfx.Path
	},
	createTextPath: function(text){
		// summary: creates a text shape
		// text: Object: a textpath object (see dojox.gfx.defaultTextPath)
		return this.createObject(dojox.gfx.TextPath, {}).setText(text);	// dojox.gfx.TextPath
	},
	createObject: function(shapeType, rawShape){
		// summary: creates an instance of the passed shapeType class
		// shapeType: Function: a class constructor to create an instance of
		// rawShape: Object: properties to be passed in to the classes "setShape" method

		// SHOULD BE RE-IMPLEMENTED BY THE RENDERER!

		return null;	// dojox.gfx.Shape
	}
};

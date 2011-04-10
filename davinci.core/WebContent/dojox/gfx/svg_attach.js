dojo.require("dojox.gfx.svg");

dojo.experimental("dojox.gfx.svg_attach");

(function(){
	dojox.gfx.attachNode = function(node){
		// summary: creates a shape from a Node
		// node: Node: an SVG node
		if(!node) return null;
		var s = null;
		switch(node.tagName.toLowerCase()){
			case dojox.gfx.Rect.nodeType:
				s = new dojox.gfx.Rect(node);
				attachRect(s);
				break;
			case dojox.gfx.Ellipse.nodeType:
				s = new dojox.gfx.Ellipse(node);
				attachShape(s, dojox.gfx.defaultEllipse);
				break;
			case dojox.gfx.Polyline.nodeType:
				s = new dojox.gfx.Polyline(node);
				attachShape(s, dojox.gfx.defaultPolyline);
				break;
			case dojox.gfx.Path.nodeType:
				s = new dojox.gfx.Path(node);
				attachShape(s, dojox.gfx.defaultPath);
				break;
			case dojox.gfx.Circle.nodeType:
				s = new dojox.gfx.Circle(node);
				attachShape(s, dojox.gfx.defaultCircle);
				break;
			case dojox.gfx.Line.nodeType:
				s = new dojox.gfx.Line(node);
				attachShape(s, dojox.gfx.defaultLine);
				break;
			case dojox.gfx.Image.nodeType:
				s = new dojox.gfx.Image(node);
				attachShape(s, dojox.gfx.defaultImage);
				break;
			case dojox.gfx.Text.nodeType:
				var t = node.getElementsByTagName("textPath");
				if(t && t.length){
					s = new dojox.gfx.TextPath(node);
					attachShape(s, dojox.gfx.defaultPath);
					attachTextPath(s);
				}else{
					s = new dojox.gfx.Text(node);
					attachText(s);
				}
				attachFont(s);
				break;
			default:
				//console.debug("FATAL ERROR! tagName = " + node.tagName);
				return null;
		}
		if(!(s instanceof dojox.gfx.Image)){
			attachFill(s);
			attachStroke(s);
		}
		attachTransform(s);
		return s;	// dojox.gfx.Shape
	};

	dojox.gfx.attachSurface = function(node){
		// summary: creates a surface from a Node
		// node: Node: an SVG node
		var s = new dojox.gfx.Surface();
		s.rawNode = node;
		var def_elems = node.getElementsByTagName("defs");
		if(def_elems.length == 0){
			return null;	// dojox.gfx.Surface
		}
		s.defNode = def_elems[0];
		return s;	// dojox.gfx.Surface
	};

	var attachFill = function(object){
		// summary: deduces a fill style from a node.
		// object: dojox.gfx.Shape: an SVG shape
		var fill = object.rawNode.getAttribute("fill");
		if(fill == "none"){
			object.fillStyle = null;
			return;
		}
		var fillStyle = null, gradient = dojox.gfx.svg.getRef(fill);
		if(gradient){
			switch(gradient.tagName.toLowerCase()){
				case "lineargradient":
					fillStyle = _getGradient(dojox.gfx.defaultLinearGradient, gradient);
					dojo.forEach(["x1", "y1", "x2", "y2"], function(x){
						fillStyle[x] = gradient.getAttribute(x);
					});
					break;
				case "radialgradient":
					fillStyle = _getGradient(dojox.gfx.defaultRadialGradient, gradient);
					dojo.forEach(["cx", "cy", "r"], function(x){
						fillStyle[x] = gradient.getAttribute(x);
					});
					fillStyle.cx = gradient.getAttribute("cx");
					fillStyle.cy = gradient.getAttribute("cy");
					fillStyle.r  = gradient.getAttribute("r");
					break;
				case "pattern":
					fillStyle = dojo.lang.shallowCopy(dojox.gfx.defaultPattern, true);
					dojo.forEach(["x", "y", "width", "height"], function(x){
						fillStyle[x] = gradient.getAttribute(x);
					});
					fillStyle.src = gradient.firstChild.getAttributeNS(dojox.gfx.svg.xmlns.xlink, "href");
					break;
			}
		}else{
			fillStyle = new dojo.Color(fill);
			var opacity = object.rawNode.getAttribute("fill-opacity");
			if(opacity != null){ fillStyle.a = opacity; }
		}
		object.fillStyle = fillStyle;
	};

	var _getGradient = function(defaultGradient, gradient){
		var fillStyle = dojo.clone(defaultGradient);
		fillStyle.colors = [];
		for(var i = 0; i < gradient.childNodes.length; ++i){
			fillStyle.colors.push({
				offset: gradient.childNodes[i].getAttribute("offset"),
				color:  new dojo.Color(gradient.childNodes[i].getAttribute("stop-color"))
			});
		}
		return fillStyle;
	};

	var attachStroke = function(object){
		// summary: deduces a stroke style from a node.
		// object: dojox.gfx.Shape: an SVG shape
		var rawNode = object.rawNode, stroke = rawNode.getAttribute("stroke");
		if(stroke == null || stroke == "none"){
			object.strokeStyle = null;
			return;
		}
		var strokeStyle = object.strokeStyle = dojo.clone(dojox.gfx.defaultStroke);
		var color = new dojo.Color(stroke);
		if(color){
			strokeStyle.color = color;
			strokeStyle.color.a = rawNode.getAttribute("stroke-opacity");
			strokeStyle.width = rawNode.getAttribute("stroke-width");
			strokeStyle.cap = rawNode.getAttribute("stroke-linecap");
			strokeStyle.join = rawNode.getAttribute("stroke-linejoin");
			if(strokeStyle.join == "miter"){
				strokeStyle.join = rawNode.getAttribute("stroke-miterlimit");
			}
			strokeStyle.style = rawNode.getAttribute("dojoGfxStrokeStyle");
		}
	};

	var attachTransform = function(object){
		// summary: deduces a transformation matrix from a node.
		// object: dojox.gfx.Shape: an SVG shape
		var matrix = object.rawNode.getAttribute("transform");
		if(matrix.match(/^matrix\(.+\)$/)){
			var t = matrix.slice(7, -1).split(",");
			object.matrix = dojox.gfx.matrix.normalize({
				xx: parseFloat(t[0]), xy: parseFloat(t[2]),
				yx: parseFloat(t[1]), yy: parseFloat(t[3]),
				dx: parseFloat(t[4]), dy: parseFloat(t[5])
			});
		}else{
			object.matrix = null;
		}
	};

	var attachFont = function(object){
		// summary: deduces a font style from a Node.
		// object: dojox.gfx.Shape: an SVG shape
		var fontStyle = object.fontStyle = dojo.clone(dojox.gfx.defaultFont),
			r = object.rawNode;
		fontStyle.style = r.getAttribute("font-style");
		fontStyle.variant = r.getAttribute("font-variant");
		fontStyle.weight = r.getAttribute("font-weight");
		fontStyle.size = r.getAttribute("font-size");
		fontStyle.family = r.getAttribute("font-family");
	};

	var attachShape = function(object, def){
		// summary: builds a shape from a node.
		// object: dojox.gfx.Shape: an SVG shape
		// def: Object: a default shape template
		var shape = object.shape = dojo.clone(def), r = object.rawNode;
		for(var i in shape) {
			shape[i] = r.getAttribute(i);
		}
	};

	var attachRect = function(object){
		// summary: builds a rectangle shape from a node.
		// object: dojox.gfx.Shape: an SVG shape
		attachShape(object, dojox.gfx.defaultRect);
		object.shape.r = Math.min(object.rawNode.getAttribute("rx"), object.rawNode.getAttribute("ry"));
	};

	var attachText = function(object){
		// summary: builds a text shape from a node.
		// object: dojox.gfx.Shape: an SVG shape
		var shape = object.shape = dojo.clone(dojox.gfx.defaultText),
			r = object.rawNode;
		shape.x = r.getAttribute("x");
		shape.y = r.getAttribute("y");
		shape.align = r.getAttribute("text-anchor");
		shape.decoration = r.getAttribute("text-decoration");
		shape.rotated = parseFloat(r.getAttribute("rotate")) != 0;
		shape.kerning = r.getAttribute("kerning") == "auto";
		shape.text = r.firstChild.nodeValue;
	};

	var attachTextPath = function(object){
		// summary: builds a textpath shape from a node.
		// object: dojox.gfx.Shape: an SVG shape
		var shape = object.shape = dojo.clone(dojox.gfx.defaultTextPath),
			r = object.rawNode;
		shape.align = r.getAttribute("text-anchor");
		shape.decoration = r.getAttribute("text-decoration");
		shape.rotated = parseFloat(r.getAttribute("rotate")) != 0;
		shape.kerning = r.getAttribute("kerning") == "auto";
		shape.text = r.firstChild.nodeValue;
	};
})();

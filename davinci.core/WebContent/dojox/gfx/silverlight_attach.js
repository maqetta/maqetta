dojo.require("dojox.gfx.silverlight");

dojo.experimental("dojox.gfx.silverlight_attach");

(function(){
	dojox.gfx.attachNode = function(node){
		// summary: creates a shape from a Node
		// node: Node: an Silverlight node
		return null;	// for now
		if(!node) return null;
		var s = null;
		switch(node.tagName.toLowerCase()){
			case dojox.gfx.Rect.nodeType:
				s = new dojox.gfx.Rect(node);
				break;
			case dojox.gfx.Ellipse.nodeType:
				if(node.width == node.height){
					s = new dojox.gfx.Circle(node);
				}else{
					s = new dojox.gfx.Ellipse(node);
				}
				break;
			case dojox.gfx.Polyline.nodeType:
				s = new dojox.gfx.Polyline(node);
				break;
			case dojox.gfx.Path.nodeType:
				s = new dojox.gfx.Path(node);
				break;
			case dojox.gfx.Line.nodeType:
				s = new dojox.gfx.Line(node);
				break;
			case dojox.gfx.Image.nodeType:
				s = new dojox.gfx.Image(node);
				break;
			case dojox.gfx.Text.nodeType:
				s = new dojox.gfx.Text(node);
				attachFont(s);
				break;
			default:
				//console.debug("FATAL ERROR! tagName = " + node.tagName);
				return null;
		}
		attachShape(s);
		if(!(s instanceof dojox.gfx.Image)){
			attachFill(s);
			attachStroke(s);
		}
		attachTransform(s);
		return s;	// dojox.gfx.Shape
	};

	dojox.gfx.attachSurface = function(node){
		// summary: creates a surface from a Node
		// node: Node: an Silverlight node
		return null;	// dojox.gfx.Surface
	};

	var attachFill = function(rawNode){
		// summary: deduces a fill style from a Node.
		// rawNode: Node: an Silverlight node
		return null;	// Object
	};

	var attachStroke = function(rawNode){
		// summary: deduces a stroke style from a Node.
		// rawNode: Node: an SVG node
		return null;	// Object
	};

	var attachTransform = function(rawNode){
		// summary: deduces a transformation matrix from a Node.
		// rawNode: Node: an Silverlight node
		return null;	// dojox.gfx.matrix.Matrix
	};

	var attachFont = function(rawNode){
		// summary: deduces a font style from a Node.
		// rawNode: Node: an Silverlight node
		return null;	// Object
	};

	var attachShape = function(rawNode){
		// summary: builds a shape from a Node.
		// rawNode: Node: an Silverlight node
		return null;	// dojox.gfx.Shape
	};
})();

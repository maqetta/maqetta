dojo.provide("dojox.gfx._base");

(function(){
	var g = dojox.gfx, b = g._base;

	// candidates for dojox.style (work on VML and SVG nodes)
	g._hasClass = function(/*DomNode*/node, /*String*/classStr){
		//	summary:
		//		Returns whether or not the specified classes are a portion of the
		//		class list currently applied to the node.
		// return (new RegExp('(^|\\s+)'+classStr+'(\\s+|$)')).test(node.className)	// Boolean
		var cls = node.getAttribute("className");
		return cls && (" " + cls + " ").indexOf(" " + classStr + " ") >= 0;  // Boolean
	}
	g._addClass = function(/*DomNode*/node, /*String*/classStr){
		//	summary:
		//		Adds the specified classes to the end of the class list on the
		//		passed node.
		var cls = node.getAttribute("className") || "";
		if(!cls || (" " + cls + " ").indexOf(" " + classStr + " ") < 0){
			node.setAttribute("className", cls + (cls ? " " : "") + classStr);
		}
	}
	g._removeClass = function(/*DomNode*/node, /*String*/classStr){
		//	summary: Removes classes from node.
		var cls = node.getAttribute("className");
		if(cls){
			node.setAttribute(
				"className", 
				cls.replace(new RegExp('(^|\\s+)' + classStr + '(\\s+|$)'), "$1$2")
			);
		}
	}

	// candidate for dojox.html.metrics (dynamic font resize handler is not implemented here)

	//	derived from Morris John's emResized measurer
	b._getFontMeasurements = function(){
		//	summary:
		//		Returns an object that has pixel equivilents of standard font
		//		size values.
		var heights = {
			'1em': 0, '1ex': 0, '100%': 0, '12pt': 0, '16px': 0, 'xx-small': 0,
			'x-small': 0, 'small': 0, 'medium': 0, 'large': 0, 'x-large': 0,
			'xx-large': 0
		};

		if(dojo.isIE){
			//	we do a font-size fix if and only if one isn't applied already.
			//	NOTE: If someone set the fontSize on the HTML Element, this will kill it.
			dojo.doc.documentElement.style.fontSize="100%";
		}

		//	set up the measuring node.
		var div = dojo.doc.createElement("div");
		var s = div.style;
		s.position = "absolute";
		s.left = "-100px";
		s.top = "0px";
		s.width = "30px";
		s.height = "1000em";
		s.borderWidth = "0px";
		s.margin = "0px";
		s.padding = "0px";
		s.outline = "none";
		s.lineHeight = "1";
		s.overflow = "hidden";
		dojo.body().appendChild(div);

		//	do the measurements.
		for(var p in heights){
			div.style.fontSize = p;
			heights[p] = Math.round(div.offsetHeight * 12/16) * 16/12 / 1000;
		}

		dojo.body().removeChild(div);
		div = null;
		return heights; 	//	object
	};

	var fontMeasurements = null;

	b._getCachedFontMeasurements = function(recalculate){
		if(recalculate || !fontMeasurements){
			fontMeasurements = b._getFontMeasurements();
		}
		return fontMeasurements;
	};

	// candidate for dojox.html.metrics

	var measuringNode = null, empty = {};
	b._getTextBox = function(	/*String*/ text,
								/*Object*/ style,
								/*String?*/ className){
		var m, s, al = arguments.length;
		if(!measuringNode){
			m = measuringNode = dojo.doc.createElement("div");
			s = m.style;
			s.position = "absolute";
			s.left = "-10000px";
			s.top = "0";
			dojo.body().appendChild(m);
		}else{
			m = measuringNode;
			s = m.style;
		}
		// reset styles
		m.className = "";
		s.borderWidth = "0";
		s.margin = "0";
		s.padding = "0";
		s.outline = "0";
		// set new style
		if(al > 1 && style){
			for(var i in style){
				if(i in empty){ continue; }
				s[i] = style[i];
			}
		}
		// set classes
		if(al > 2 && className){
			m.className = className;
		}
		// take a measure
		m.innerHTML = text;

		if(m["getBoundingClientRect"]){
			var bcr = m.getBoundingClientRect();
			return {l: bcr.left, t: bcr.top, w: bcr.width || (bcr.right - bcr.left), h: bcr.height || (bcr.bottom - bcr.top)};
		}else{
			return dojo.marginBox(m);
		}
	};

	// candidate for dojo.dom

	var uniqueId = 0;
	b._getUniqueId = function(){
		// summary: returns a unique string for use with any DOM element
		var id;
		do{
			id = dojo._scopeName + "Unique" + (++uniqueId);
		}while(dojo.byId(id));
		return id;
	};
})();

dojo.mixin(dojox.gfx, {
	//	summary:
	// 		defines constants, prototypes, and utility functions

	// default shapes, which are used to fill in missing parameters
	defaultPath: {
		type: "path", path: ""
	},
	defaultPolyline: {
		type: "polyline", points: []
	},
	defaultRect: {
		type: "rect", x: 0, y: 0, width: 100, height: 100, r: 0
	},
	defaultEllipse: {
		type: "ellipse", cx: 0, cy: 0, rx: 200, ry: 100
	},
	defaultCircle: {
		type: "circle", cx: 0, cy: 0, r: 100
	},
	defaultLine: {
		type: "line", x1: 0, y1: 0, x2: 100, y2: 100
	},
	defaultImage: {
		type: "image", x: 0, y: 0, width: 0, height: 0, src: ""
	},
	defaultText: {
		type: "text", x: 0, y: 0, text: "", align: "start",
		decoration: "none", rotated: false, kerning: true
	},
	defaultTextPath: {
		type: "textpath", text: "", align: "start",
		decoration: "none", rotated: false, kerning: true
	},

	// default geometric attributes
	defaultStroke: {
		type: "stroke", color: "black", style: "solid", width: 1, 
		cap: "butt", join: 4
	},
	defaultLinearGradient: {
		type: "linear", x1: 0, y1: 0, x2: 100, y2: 100,
		colors: [
			{ offset: 0, color: "black" }, { offset: 1, color: "white" }
		]
	},
	defaultRadialGradient: {
		type: "radial", cx: 0, cy: 0, r: 100,
		colors: [
			{ offset: 0, color: "black" }, { offset: 1, color: "white" }
		]
	},
	defaultPattern: {
		type: "pattern", x: 0, y: 0, width: 0, height: 0, src: ""
	},
	defaultFont: {
		type: "font", style: "normal", variant: "normal", 
		weight: "normal", size: "10pt", family: "serif"
	},

	getDefault: (function(){
		var typeCtorCache = {};
		// a memoized delegate()
		return function(/*String*/ type){
			var t = typeCtorCache[type];
			if(t){
				return new t();
			}
			t = typeCtorCache[type] = new Function;
			t.prototype = dojox.gfx[ "default" + type ];
			return new t();
		}
	})(),

	normalizeColor: function(/*Color*/ color){
		//	summary:
		// 		converts any legal color representation to normalized
		// 		dojo.Color object
		return (color instanceof dojo.Color) ? color : new dojo.Color(color); // dojo.Color
	},
	normalizeParameters: function(existed, update){
		//	summary:
		// 		updates an existing object with properties from an "update"
		// 		object
		//	existed: Object
		//		the "target" object to be updated
		//	update:  Object
		//		the "update" object, whose properties will be used to update
		//		the existed object
		if(update){
			var empty = {};
			for(var x in existed){
				if(x in update && !(x in empty)){
					existed[x] = update[x];
				}
			}
		}
		return existed;	// Object
	},
	makeParameters: function(defaults, update){
		//	summary:
		// 		copies the original object, and all copied properties from the
		// 		"update" object
		//	defaults: Object
		//		the object to be cloned before updating
		//	update:   Object
		//		the object, which properties are to be cloned during updating
		if(!update){
			// return dojo.clone(defaults);
			return dojo.delegate(defaults);
		}
		var result = {};
		for(var i in defaults){
			if(!(i in result)){
				result[i] = dojo.clone((i in update) ? update[i] : defaults[i]);
			}
		}
		return result; // Object
	},
	formatNumber: function(x, addSpace){
		// summary: converts a number to a string using a fixed notation
		// x:			Number:		number to be converted
		// addSpace:	Boolean?:	if it is true, add a space before a positive number
		var val = x.toString();
		if(val.indexOf("e") >= 0){
			val = x.toFixed(4);
		}else{
			var point = val.indexOf(".");
			if(point >= 0 && val.length - point > 5){
				val = x.toFixed(4);
			}
		}
		if(x < 0){
			return val; // String
		}
		return addSpace ? " " + val : val; // String
	},
	// font operations
	makeFontString: function(font){
		// summary: converts a font object to a CSS font string
		// font:	Object:	font object (see dojox.gfx.defaultFont)
		return font.style + " " + font.variant + " " + font.weight + " " + font.size + " " + font.family; // Object
	},
	splitFontString: function(str){
		// summary:
		//		converts a CSS font string to a font object
		// description:
		//		Converts a CSS font string to a gfx font object. The CSS font
		//		string components should follow the W3C specified order
		//		(see http://www.w3.org/TR/CSS2/fonts.html#font-shorthand):
		//		style, variant, weight, size, optional line height (will be
		//		ignored), and family.
		// str: String
		//		a CSS font string
		var font = dojox.gfx.getDefault("Font");
		var t = str.split(/\s+/);
		do{
			if(t.length < 5){ break; }
			font.style   = t[0];
			font.variant = t[1];
			font.weight  = t[2];
			var i = t[3].indexOf("/");
			font.size = i < 0 ? t[3] : t[3].substring(0, i);
			var j = 4;
			if(i < 0){
				if(t[4] == "/"){
					j = 6;
				}else if(t[4].charAt(0) == "/"){
					j = 5;
				}
			}
			if(j < t.length){
				font.family = t.slice(j).join(" ");
			}
		}while(false);
		return font;	// Object
	},
	// length operations
	cm_in_pt: 72 / 2.54,	// Number: points per centimeter
	mm_in_pt: 7.2 / 2.54,	// Number: points per millimeter
	px_in_pt: function(){
		// summary: returns a number of pixels per point
		return dojox.gfx._base._getCachedFontMeasurements()["12pt"] / 12;	// Number
	},
	pt2px: function(len){
		// summary: converts points to pixels
		// len: Number: a value in points
		return len * dojox.gfx.px_in_pt();	// Number
	},
	px2pt: function(len){
		// summary: converts pixels to points
		// len: Number: a value in pixels
		return len / dojox.gfx.px_in_pt();	// Number
	},
	normalizedLength: function(len) {
		// summary: converts any length value to pixels
		// len: String: a length, e.g., "12pc"
		if(len.length == 0) return 0;
		if(len.length > 2){
			var px_in_pt = dojox.gfx.px_in_pt();
			var val = parseFloat(len);
			switch(len.slice(-2)){
				case "px": return val;
				case "pt": return val * px_in_pt;
				case "in": return val * 72 * px_in_pt;
				case "pc": return val * 12 * px_in_pt;
				case "mm": return val * dojox.gfx.mm_in_pt * px_in_pt;
				case "cm": return val * dojox.gfx.cm_in_pt * px_in_pt;
			}
		}
		return parseFloat(len);	// Number
	},

	// a constant used to split a SVG/VML path into primitive components
	pathVmlRegExp: /([A-Za-z]+)|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,
	pathSvgRegExp: /([A-Za-z])|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,

	equalSources: function(a, b){
		// summary: compares event sources, returns true if they are equal
		return a && b && a == b;
	}
});

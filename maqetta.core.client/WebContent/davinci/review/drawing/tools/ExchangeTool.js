define([
	"dojo/_base/declare",
	"./_ToolCommon"
], function(declare, _ToolCommon) {
	
return declare("davinci.review.drawing.tools.ExchangeTool", _ToolCommon, {

	constructor: function(surface) {
		surface.exchangeTool = this;
	},

	exportShapesByAttribute: function(/*String?*/ attrName, /*Array?*/ values) {
		// summary:
		//		Export the shapes with the same tag. If the tag is not specified, export all the shapes
		var shapes = this.surface.getShapesByAttribute(attrName, values), 
			tmpStr,
			jsonString = [], 
			type;
		
		dojo.forEach(shapes, function(shape) {
			if (shape.isInstanceOf(davinci.review.drawing.shapes.Arrow)) {
				type = "Arrow";
			} else if(shape.isInstanceOf(davinci.review.drawing.shapes.Rectangle)) {
				type = "Rectangle";
			} else if(shape.isInstanceOf(davinci.review.drawing.shapes.Ellipse)) {
				type = "Ellipse";
			} else if(shape.isInstanceOf(davinci.review.drawing.shapes.Text)) {
				type = "Text";
			} else {
				return;
			}
			var o = {type:type ,x1:shape.x1, y1:shape.y1, x2:shape.x2, y2:shape.y2};
			for (var attr in shape.attributeMap) {
				if (shape.attributeMap.hasOwnProperty(attr)) {
					var s = (attr == 'stateList' || attr == 'sceneList') ?
							dojo.toJson(shape[attr]) : shape[attr];
					o[attr] = s;
				}
			}
			if (type == "Text") {
				o.text = escape(shape.getText());
			}
			tmpStr = dojo.toJson(o);
			jsonString.push(tmpStr);
		});
		return "[" + jsonString.join(",") + "]";
	},

	importShapes: function(/*String*/ data, /*Boolean*/clear, /*Function*/ a2c) {
		try {
			var shapes = eval(data),clazz, shape;
			if (clear) { 
				this.surface.clear();
			}
			dojo.forEach(shapes, function(s) {
				var type = s.type;
				if (type == "Arrow") {
					clazz = davinci.review.drawing.shapes.Arrow;
				} else if(type == "Rectangle") {
					clazz = davinci.review.drawing.shapes.Rectangle;
				} else if(type == "Ellipse") {
					clazz = davinci.review.drawing.shapes.Ellipse;
				} else if(type == "Text") {
					clazz = davinci.review.drawing.shapes.Text;
				} else {
					return;
				}
				var x1 = s.x1, x2 = s.x2, y1 = s.y1, y2 = s.y2, text = s.text;
				delete s.type;
				delete s.x1;
				delete s.x2;
				delete s.y1;
				delete s.y2;
				s.a2c = a2c;
				if(s.stateList){
					s.stateList = dojo.fromJson(s.stateList);
				}
				if(s.sceneList){
					s.sceneList = dojo.fromJson(s.sceneList);
				}
				shape = new clazz(this.surface, x1, y1, x2, y2, s);
				shape.filterAttributes = this.filterAttributes;
				shape.render();
				if (type == "Text") {
					shape.setText(unescape(text));
				}
				this.surface.shapes.push(shape);
			}, this);
		}catch(exp){
			console.log("Failed to create the shape with the definition: " + data);
		}
	}

});
});

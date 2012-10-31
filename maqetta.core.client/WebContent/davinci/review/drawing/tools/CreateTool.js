define([
	"dojo/_base/declare",
	"./_ToolCommon",
	"./scaffolds/scaffolds"
], function(declare, _ToolCommon, scaffolds) {
	
return declare("davinci.review.drawing.tools.CreateTool", _ToolCommon, {

	constructor: function(surface, filterAttributes) {
		surface.createTool = this;
	},
	
	setShape: function(/*String*/ shapeName, attributeMap) {
		if(this.surface.isDrawing) { 
			return;
		}
		this.shapeAttributeMap = attributeMap;
		if (this.scaffold) { 
			this.scaffold.destroy(); //Ensure that the scaffold is cleaned
		}
		switch (shapeName) {
		case "Arrow":
			this.scaffold = new scaffolds.ArrowScaffold(this.surface);
			this.scaffold.type = "arrow";
			break;
		case "Rectangle":
			this.scaffold = new scaffolds.RectangleScaffold(this.surface);
			this.scaffold.type = "rectangle";
			break;
		case "Ellipse":
			this.scaffold = new scaffolds.EllipseScaffold(this.surface);
			this.scaffold.type = "ellipse";
			break;
		case "Text":
			this.scaffold = new scaffolds.TextScaffold(this.surface);
			this.scaffold.type = "text";
			break;
		default:
			new Error("Invalid shape type!");
		}
	},
	
	activate: function() {
		if (this.surface.isDrawing) {  
			return;
		}
		this.surface.isDrawing = true;
		var docNode = this.surface.docNode = this.surface.domNode;
		var htmlNode = this.surface.htmlNode = docNode.documentElement;
		var bodyNode = this.surface.bodyNode = docNode.body;
		var coverDiv = this.surface.coverDiv = dojo.create('div',
				// z-index:2million because annotations are at 1million plus change
				{style:'z-index:2000000;cursor:crosshair;position:absolute; left:0px; top:0px; width:'+htmlNode.offsetWidth+'px; height:'+htmlNode.offsetHeight+'px;'},
				bodyNode);
		this._evtConns = [
			dojo.connect(coverDiv, "mousedown", this, "_mouseDown"),
			dojo.connect(docNode, "keydown", this, "_keyDown")
		];
	},

	_mouseDown: function(evt) {
		dojo.stopEvent(evt);
		this.surface.appendShape(this.scaffold.createShape(evt.pageX, evt.pageY, this.shapeAttributeMap));
		if (this.scaffold.type == "text") {
			this.scaffold.shape.filterAttributes = this.filterAttributes;
		}
		this._evtConns.push(
			dojo.connect(this.surface.coverDiv, "mouseup", this, "_mouseUp"),
			dojo.connect(this.surface.coverDiv, "mousemove", this, "_mouseMove")
		);
	},

	_mouseUp: function(evt) {
		if (this.scaffold.getEditMode) {
			this.scaffold.getEditMode();
		}
		this.deactivate();
	},

	_mouseMove: function(evt) {
		if (!this.surface.isDrawing) { 
			return;
		}
		this.scaffold.transformShape(evt.pageX, evt.pageY);
	},

	_keyDown: function(evt) {
		if (evt.keyCode == dojo.keys.ESCAPE) {
			this.deactivate();
		}
	},

	deactivate: function() {
		if (!this.surface||!this.surface.isDrawing) { 
			return;
		}
		this.surface.isDrawing = false;
		this.scaffold.destroy();
		this.scaffold = null;
		this.inherited(arguments);
		var coverDiv = this.surface.coverDiv;
		if(coverDiv){
			var parentNode = coverDiv.parentNode;
			if(parentNode){
				parentNode.removeChild(coverDiv);
			}
			this.surface.coverDiv = null;
		}
	}

});
});

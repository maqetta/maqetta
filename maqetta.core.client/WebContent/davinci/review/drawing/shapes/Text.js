define([
	"dojo/_base/declare",
	"./_ShapeCommon"
], function(declare, _ShapeCommon) {
	
return declare("davinci.review.drawing.shapes.Text", _ShapeCommon, {

	render: function() {
		if (!this.shapeNode) {
			this._createEditArea();
			this._evtConns.push(
				dojo.connect(this.shapeNode, "mouseover", this, "onMouseOver"),
				dojo.connect(this.shapeNode, "mouseout", this, "onMouseOut"),
				dojo.connect(this.shapeNode, "mousedown", this, "onMouseDown"),
				dojo.connect(this.shapeNode, "dblclick", this, "_onDoubleClick"),
				dojo.connect(this.shapeNode, "blur", this, "_onblur")
			);
		}
		this._transformTextArea();
		this.inherited(arguments);
	},

	setText: function(text) {
		this.shapeNode.innerHTML = text;
	},

	getText: function() {
		return this.shapeNode.innerHTML.replace(/"/g, "'");
	},

	getEditMode: function() {
		if(!this.surface.isActivated) return;
		this.editable = true;
		dojo.attr(this.shapeNode, "contenteditable", "true");
		dojo.style(this.shapeNode, "cursor", "");
		this.shapeNode.focus();
	},

	_createEditArea: function() {
		this.shapeNode = dojo.create("div");
		this.width = Math.abs(this.x1 - this.x2);
		this.height = Math.abs(this.y1 - this.y2);
		dojo.style(this.shapeNode, {
			"position": "absolute",
			"padding": "2px",
			"margin": "0px",
			"border": "1px dotted black",
			"overflow": "hidden",
			"color": this.color,
			"width": this.width + "px",
			"height": this.height + "px"
		});
	},

	_transformTextArea: function() {
		this.width = Math.abs(this.x1 - this.x2);
		this.height = Math.abs(this.y1 - this.y2);
		dojo.style(this.shapeNode, {
			"left": this.x1 + "px",
			"top": this.y1 + "px",
			"width": this.width + "px",
			"height": this.height + "px"
		});
	},

	_onDoubleClick: function(evt) {
		if (!this.surface.isActivated || !this.isReadOnly()) {
			return;
		}
		this.editable = true;
		dojo.attr(this.shapeNode, "contenteditable", "true");
		dojo.style(this.shapeNode, "cursor", "");
		this.shapeNode.focus();
	},

	_onblur: function(evt) {
		if (!this.surface.isActivated) {
			return;
		}
		this.editable = false;
		dojo.attr(this.shapeNode, "contenteditable", "false");
		dojo.style(this.shapeNode, "cursor", "auto");
	},

	isReadOnly: function(){
		var surface = this.surface, secAttrs = this.filterAttributes;
		return dojo.every(secAttrs, function(attr) {
			return this[attr] && surface[attr] && this[attr] == surface[attr];
		}, this);
	}

});
});
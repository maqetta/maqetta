define([
	"dojo/_base/declare"
], function(declare) {

return declare("davinci.model.Model", null, {
	/**
	 * @class davinci.model.Model
	 * @constructor     
	 */
	constructor: function() {
		this.elementType = "";
		this.name = "";
		this.startOffset = 0;
		this.endOffset = 0;
		this.parent = null;
		this.children = [];
	},

	inherits: function( parent ) {
		if ( arguments.length > 1 ) {
			parent.apply( this, Array.prototype.slice.call( arguments, 1 ) );
		} else {
			parent.call( this );
		}
	},

	getText: function() {
	},

	setText: function(text) {
	},

	addChild: function(child,index, fromParser) {
		child.parent = this;	
		if (index != undefined) {
			this.children.splice(index, 0, child);
		} else {
			this.children.push(child);
		}
	},

	setStart: function(offset) {
		this.startOffset = offset;
	},

	setEnd: function(offset) {
		this.endOffset = offset;
	},

	getLabel: function() {
		return null;
	},

	getID: function() {
		return null;
	},
	
	/*
	 * Intended to be overridden by subclasses (e.g., for example in mapping
	 * editor offets to HTML model offsets). The default implementation just
	 * returns a struct with an unchanged start/end offset.
	 */
	mapPositions: function(element) {
		return {
			startOffset : element.startOffset,
			endOffset : element.endOffset
		};
	},

	findChildAtPosition: function (position) {
		if ( ! position.endOffset ) {
			position.endOffset = position.startOffset;
		}

		if (position.startOffset >= this.startOffset  && position.endOffset <= this.endOffset) {
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i].findChildAtPosition(position);
				if (child != null) {
					return child;
				}
			}
			return this;
		}
		return null;
	},

	removeChild: function(child) {
		for (var i=0; i<this.children.length; i++)
			if (this.children[i] == child) {
				this.children.splice(i, 1);
				return;
			}
	},

	find: function (attributeMap, stopOnFirst) {
		/* search for nodes with given attributes, example:
		 * 
		 * {'elementType':'CSSFile', 'url': ./app.css'} 
		 * 
		 * matches all elemenType = "CSSFile" with url = ./app1.css
		 */
		var visitor = {
				visit: function(node) {
					if (this.found.length > 0 && stopOnFirst) {
						return true;
					}
					var name = null;
					for (name in attributeMap) {
						if (node[name] != attributeMap[name]) {
							break;
						}
					}
					if (node[name] == attributeMap[name]) {
						this.found.push(node);
					}
					return false;
				},	
				found :[]
		};
		this.visit(visitor);
		if(stopOnFirst ) {
			return (visitor.found.length > 0) ? visitor.found[0] : null;
		}
		return visitor.found;
	},

	setDirty: function(isDirty) {
		this.dirtyResource = isDirty;
	},

	isDirty: function() {
		return this.dirtyResource;
	},

	searchUp: function(elementType) {
		if (this.elementType == elementType)  {
			return this;
		}
		var parent = this.parent;
		while (parent && parent.elementType != elementType) {
			parent = parent.parent;
		}
		return parent;
	},

	visit: function(visitor) {
		if (!visitor.visit(this)) {
			for (var i=0;i<this.children.length;i++) {
				this.children[i].visit(visitor);
			}
		}
		if(visitor.endVisit) visitor.endVisit(this);	
	},

	updatePositions: function(model, offset, delta) {
		visitor = {
				visit: function(element) {
					if (element.endOffset < offset) {
						return true;
					}
					if (element.startOffset >= offset) {
						element.startOffset += delta;
						element.endOffset += delta;
					} else if (element.endOffset >= offset) {
						element.endOffset += delta;
					}
				}
		};
		model.visit(visitor);
	}

});
});


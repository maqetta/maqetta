define([
	"dojo/_base/declare",
	"dojo/dom-attr",
	"./_Widget"
], function(
	declare,
	domAttr,
	_Widget
) {

return declare("davinci.ve.ObjectWidget", _Widget, {

	isObjectWidget: true,

	constructor: function (params,node,dijitWidget,metadata,srcElement) {
		if (typeof dijitWidget === 'string') {
			domAttr.set(node, 'data-dojo-type', dijitWidget);
			if (srcElement) {
				srcElement.addAttribute('data-dojo-type', dijitWidget);
			}
		}
	},

	postCreate: function() {
		var id = this._params.jsId,
			dj = require("davinci/ve/widget")._dojo(this.domNode),
			object;
		if (id) {
			domAttr.set(this.domNode, 'jsId', id);
			var type = this.getObjectType();
			if (type) {
				var c = dj.getObject(type.replace(/\//g, ".")); // FIXME: assumes global object definition matching module id
				if (c) {
					if (c.markupFactory) {
						object = c.markupFactory(this._params, this.domNode, c);
					} else if(c.prototype && c.prototype.markupFactory) {
						object = c.prototype.markupFactory(this._params, this.domNode, c);
					} else {
						object = new c(this._params, this.domNode);
					}
					if (object) {
						object._edit_object_id = id;
						dj.setObject(id, object);
					}
				}
			}
		} else {
			id = this.getObjectId();
			if (id) {
				object = dj.getObject(id);
				if (object) {
					object._edit_object_id = id;
				}
			}
		}
	},

	getObjectType: function() {
		var node = this.domNode,
			type = domAttr.get(node, 'data-dojo-type') || domAttr.get(node, 'dojoType');
		type = type.replace(/\./g, "/");
		return type;
	},

	getObjectId: function() {
		return domAttr.get(this.domNode, 'jsId');
	},

	_getChildren: function() {
		return [];
	}

});

});

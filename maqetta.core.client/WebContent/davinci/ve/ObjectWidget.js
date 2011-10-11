define("davinci/ve/ObjectWidget", ["davinci/ve/_Widget"], function() {

dojo.declare("davinci.ve.ObjectWidget",davinci.ve._Widget, {
	isObjectWidget: true,

	constructor: function (params,node,dijitWidget,metadata,srcElement) {
		if (dojo.isString(dijitWidget)) {
			dojo.attr(node, "dojoType", dijitWidget);
			if(srcElement) {
				srcElement.addAttribute("dojoType", dijitWidget);
			}
		}
	},

	postCreate: function() {
		var id = this._params.jsId;
		if(id) {
			this.domNode.setAttribute("jsId", id);
			var type = this.getObjectType();
			if(type) {
				var d = davinci.ve.widget._dojo(this.domNode);
				var c = d.getObject(type);
				if(c) {
					var object = undefined;
					if(c.markupFactory) {
						object = c.markupFactory(this._params, this.domNode, c);
					}else if(c.prototype && c.prototype.markupFactory) {
						object = c.prototype.markupFactory(this._params, this.domNode, c);
					}else{
						object = new c(this._params, this.domNode);
					}
					if(object) {
						object._edit_object_id = id;
						d.setObject(id, object);
					}
				}
			}
		} else {
			id =this.getObjectId();
			if(id) {
				var object = davinci.ve.widget._dojo(this.domNode).getObject(id);
				if(object) {
					object._edit_object_id = id;
				}
			}
		}
	},

	getObjectType: function() {
		return this.domNode.getAttribute("dojoType");
	},

	getObjectId: function() {
		return this.domNode.getAttribute("jsId");
	},

	getChildren: function() {
		return [];
	}

});

});

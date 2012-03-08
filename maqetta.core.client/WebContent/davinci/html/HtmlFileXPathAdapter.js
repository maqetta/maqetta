/**
 * Adapter for `XPathUtils.getXPath()`; handles the HTMLFile-specific
 * characteristics.  See XPathUtils.js for more info.
 */

define(function() {

function HtmlFileXPathAdapter(elem) {
	this.elem = elem;
}
HtmlFileXPathAdapter.prototype = {
	name: function() {
		return this.elem.tag;
	},

	parent: function() {
		var parent = this.elem.parent;
		if (parent.elementType !== 'HTMLFile') {
			return new HtmlFileXPathAdapter(parent);
		}
	},

	index: function() {
		var tag = this.elem.tag,
			children = this.elem.parent.children,
			elems,
			idx = 0;

		if (children.length === 1) {
			// if parent has only one child, no reason to calculate idx
			return 0;
		}

		elems = children.filter(function(child) {
			return child.tag === tag;
		});

		if (elems.length > 1) {
			elems.some(function(child, index) {
				if (child === this.elem) {
					idx = index + 1;
					return true;
				}
			}, this);
		}
		return idx;
	}
};

return HtmlFileXPathAdapter;

});
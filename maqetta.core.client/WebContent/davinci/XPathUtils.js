/**
 * Utility methods for working with XPath in the browser.
 */

define(function() {

/**
 * An DOM adapter, which can be used with `getXPath()`.
 */
function DOMAdapter(node) {
	this.node = node;
}

var TEMP_ID = '__XPATH_UTILS_TEMP_ID__';

DOMAdapter.prototype = {
	name: function() {
		return this.node.nodeName;
	},

	parent: function() {
		var parent = this.node.parentNode;
		if (parent !== this.node.ownerDocument) {
			return new DOMAdapter(parent);
		}
	},

	index: function() {
		var tag = this.node.nodeName,
			parent = this.node.parentNode,
			fakeId = false,
			elems,
			idx = 0;

		if (!parent.id) {
			parent.id = TEMP_ID + Date.now();
			fakeId = true;
		}

		elems = parent.querySelectorAll('#' + parent.id + '>' + tag);
		if (elems.length > 1) {
			for (var i = 0, len = elems.length; i < len; i++) {
				if (elems[i] === this.node) {
					idx = i + 1;
					break;
				}
			}
		}

		if (fakeId) {
			parent.id = '';
		}

		return idx;
	}
};

var RE_XPATH = /(\w+)(?:\[(\d+)\])?/;

return /* XPathUtils */ {
	/**
	 * Returns a full XPath for the given tree-model node.  This function does
	 * not work on a specific model (i.e. the DOM), but is generic.  The model
	 * specific code is handled by the `Adapter` param.
	 * @param  {Object} node
	 *          The node for which to ger the XPath.
	 * @param  {Object} Adapter
	 *          An object which provides the model-specific code.  This object
	 *          must provide the following functions:
	 *          {
	 *              // Return the name for the node (i.e. 'span' or 'input').
	 *              // @return {string}
	 *              name: function(),
	 *
	 *              // Return the parent of the current node, also wrapped in an
	 *              // Adapter object.  If the current node is the top-most
	 *              // (i.e. 'html'), return null.
	 *              // @return {Adapter}
	 *              parent: function(),
	 *
	 *              // If there are one or more sibling nodes with the same name
	 *              // as the current node, return the index (starting a '1') of
	 *              // the current node amongst those sibling nodes of the same
	 *              // name.  If there are no sibling nodes with the same name,
	 *              // return `0` (zero). For example, if the current node is a
	 *              // 'span' and is the 3rd such 'span' node in its parent,
	 *              // then return '3'.
	 *              // @return {number}
	 *              index: function()
	 *          }
	 *
	 *          Defaults to `DOMAdapter`, if not specified.
	 * @return {string} full XPath for given node
	 */
	getXPath: function(node, Adapter) {
		function _get(path, elem) {
			var tag = elem.name(),
				parent = elem.parent();
			if (parent) {
				var idx = elem.index();
				if (idx) {
					tag += '[' + idx + ']';
				} else {
					//For consistency, always add the brackets
					tag += '[' + 1 + ']';
				}
				path = tag + (path ? '/' + path : '');
				return _get(path, parent);
			}
			return '/' + tag + '/' + path;
		}

		Adapter = Adapter || DOMAdapter;
		var elem = new Adapter(node);

		return _get('', elem).toLowerCase();
	},

	/**
	 * Convert an XPath string to CSS Selectors notation, usable by
	 * `querySelector`.
	 * @param  {string} xpath
	 * @return {string}
	 */
	toCssPath: function(xpath) {
		if (xpath.charAt(0) === '/') {
			xpath = xpath.substr(1);
		}

		var str = '';
		xpath.split('/').forEach(function(path) {
			var m = path.match(RE_XPATH),
				tag = m[1],
				idx = m[2];
			str += (str ? '>' : '') + tag;
			if (idx) {
				str += ':nth-of-type(' + idx + ')';
			}
		});

		return str;
	}
};

});
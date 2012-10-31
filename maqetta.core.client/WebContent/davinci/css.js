/**
 * AMD plugin to load a CSS file using <link>.
 */

define([
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/dom-attr" // sub-dependency, workaround for #2047
], function(baseWindow, construct) {

var head = baseWindow.doc.getElementsByTagName('head')[0],
	cache = {};

return {
	load: function(id, require, callback) {
		var url = require.toUrl(id);
		if (url in cache) {
			// already loaded
			callback();
			return;
		}

		construct.create('link',
			{
				rel: 'stylesheet',
				type: 'text/css',
				href: url
			},
			head
		);
		cache[url] = 1;
		callback();
	}
};

});
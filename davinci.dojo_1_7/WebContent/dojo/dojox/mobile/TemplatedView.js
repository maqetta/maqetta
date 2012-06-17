define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojox/mobile/SwapView",
	"dojox/mobile/parser",
//	"dijit/_TemplatedMixin",
//	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./TemplatedView.html",
	// following are widgets in template
	"dojox/mobile/Button"
], function(
	declare,
	domConstruct,
	SwapView,
	parser,
//	_TemplatedMixin,
//	_WidgetsInTemplateMixin,
	template
){

	// Can't inherit from one of the *View widgets in dojox.mobile and from
	// _TemplateMixin -- they both assume full control of this.domNode and it
	// just doesn't work.
	// Instead, roll our own templating code.
	return declare("dojox.mobile.TemplatedView", [SwapView], {

		templateString: template,

		buildRendering: function(){
			this.inherited(arguments);

			// create DOM from template
			var node = domConstruct.toDom(template);
			if (node.nodeType !== 1) {
				throw new Error('Invalid template: ' + template);
			}

			// parse any widgets in template
			parser.parse(node);

			// add DOM elements from template to existing container node
			var dest = this.containerNode;
			while (node.hasChildNodes()) {
				dest.appendChild(node.firstChild);
			}
		}

	});
});

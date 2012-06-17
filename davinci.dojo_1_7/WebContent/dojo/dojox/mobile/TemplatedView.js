define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojox/mobile/SwapView",
	"dojox/mobile/parser",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./TemplatedView.html",
	// following are widgets in template
	"dojox/mobile/Button"
], function(
	declare,
	domConstruct,
	SwapView,
	parser,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	template
){

	var _ViewContent = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		
		templateString: template,

		widgetsInTemplate: true

	});

	// Can't inherit from one of the *View widgets in dojox.mobile and from
	// _TemplateMixin -- they both assume full control of this.domNode and it
	// just doesn't work.
	//
	// Instead, put the template in its own widget and add that as a child of
	// the View.
	return declare("dojox.mobile.TemplatedView", [SwapView], {

		buildRendering: function() {
			this.inherited(arguments);
			this.addChild( new _ViewContent() );
		}

	});
});

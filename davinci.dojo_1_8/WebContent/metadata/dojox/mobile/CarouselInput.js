define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/query",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojox/html/entities",
	"../../dijit/layout/ContainerInput",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/ReparentCommand",
	"dojo/i18n!../nls/dojox"
], function (
	declare,
	lang,
	window,
	query,
	domClass,
	construct,
	entities,
	ContainerInput,
	Widget,
	CompoundCommand,
	AddCommand,
	ReparentCommand,
	dojoxNls
) {

return declare(ContainerInput, {

	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
	helpText:  "",
	
	constructor : function() {
	},

	parse: function(input) {
		var result = this.parseItems(input);
		return result;
	},
	
	update: function(widget, value) {
		var values = value;
		
		this.command = new CompoundCommand();

		var children = widget.getChildren();
		var numVisible = widget.dijitWidget.get("numVisible");

		// Carousel doesn't handle adding views dynamically, so rebuild the entire widget
		dojo.forEach(children, dojo.hitch(this, function(child) {
			this._removeChild(child);
		}));

		// go through new children and create appropriate swawpviews and CarouselItems
		var views = [];
		var swapView;
		for (var i = 0; i < value.length; i++) {
			if (i % numVisible == 0) {
				// build new SwapView
				swapView = {type: "dojox/mobile/SwapView", properties: {}, children: [], context: this._getContext()};
				views.push(swapView);
			}

			var parsed = this.parse(value[i].text);
			swapView.children.push({type: "dojox/mobile/CarouselItem", properties: {value: parsed[0].text, headerText: parsed[1].text, src: parsed[2].text}});
		}

		dojo.forEach(views, dojo.hitch(this, function(view) {
			this._addChild(widget, view);
		}));


		this._addOrExecCommand();

		// hack to make things resize correctly
		widget.dijitWidget.resizeItems();

		return widget;
	},
	
	_attr: function(widget, value) {
		var properties = {};
		var command = new ModifyCommand(widget, properties, value);
		this._addOrExecCommand(command);
	},
	
	_addChild: function(widget, data, index) {
	
		var child;
		window.withDoc(this._getContext().getDocument(), function(){
			child = Widget.createWidget(data);
		}, this);
		
		var command = new AddCommand(child, widget, index);
		this._addOrExecCommand(command);
	},

	_reparentWidget: function(widget) {
		var index = dojo.indexOf(widget.getParent(), widget);

		var command = new ReparentCommand(widget, widget.getParent(), index);
		this._addOrExecCommand(command);
	},

	serialize: function(widget, callback, value) {
		var result = [];
		var children = widget.getChildren();

		// walk all SwapViews
		for (var i = 0; i < children.length; i++) {
			var swapview = children[i];

			dojo.forEach(swapview.getChildren(), function(item) {
					var r = "";
					r += item.dijitWidget.get("value") + ", ";

					var ht = item.dijitWidget.get("headerText");
					if (ht) {
						r += ht;
					}

					r += ", " 

					var src = item.dijitWidget.get("src");
					if (src) {
						r += src;
					}

					result.push(r);
			});
		}
		
		result = this.serializeItems(result);
	
		callback(result); 
	}

});

});

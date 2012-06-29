define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_Container",
	"dijit/Dialog",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/text!./templates/Dialog.html",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojox/layout/ResizeHandle"
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, Dialog, domGeometry, style, dialogTemplateString, veNLS) {

return declare("davinci.ui.Dialog", Dialog, {
	contentStyle: null,

	buildRendering: function() {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "resizableDialog");
	},

	_setContent: function(cont, isFakeContent) {
		this.inherited(arguments);

		var div = dojo.doc.createElement("div");
		this.containerNode.appendChild(div);

		new dojox.layout.ResizeHandle({targetId: this.id}, div);
	},

	resize: function(coords) {
		var titleBarHeight = dojo.marginBox(this.titleBar).h;

		if (coords) {
			// compute paddings
			var computedStyle = style.getComputedStyle(this.containerNode);
			var output = domGeometry.getPadExtents(this.containerNode, computedStyle);

			var c = {w: coords.w-output.w, h: coords.h-output.h}
			c.h -= dojo.marginBox(this.titleBar).h;

			var contentArea = dojo.query(".dijitDialogPaneContentArea", this.containerNode)[0];
			var actionArea = dojo.query(".dijitDialogPaneActionBar", this.containerNode)[0];

			// subtract actionbar area
			c.h -= dojo.marginBox(actionArea).h;

			if (c.w) {
				dojo.style(contentArea, "width", c.w+"px");
			}

			if (c.h) {
				dojo.style(contentArea, "height", c.h+"px");
			}

			// resize children
			dojo.forEach(this.getChildren(), dojo.hitch(this, function(child) {
					if (child.resize) {
						child.resize({w: c.w, h: c.h});
					}
			}));
		}

		this._position();
	},

	show: function() {
		var result = this.inherited(arguments);

		// show will do initial sizing, lets now check if we have overrides
		if (this.contentStyle) {
			if (typeof(this.contentStyle) == "object") {
				var r = {}
				if (this.contentStyle.width) {
					r.w = parseInt(this.contentStyle.width);
				}

				if (this.contentStyle.height) {
					r.h = parseInt(this.contentStyle.height);
				}
				this.resize(r);
			}
//			this.layout();  //TODO: method disappeared in 1.8.0b1
		}

		return result;
	}
});
});

define([
	"dojo/_base/declare",
	"dijit/_Widget",
	"dijit/_Templated",
	"dijit/_Container",
	"dijit/Dialog",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/text!./templates/Dialog.html",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojox/layout/ResizeHandle"
], function(declare, _Widget, _Templated, _Container, Dialog, domGeometry, style, dialogTemplateString, veNLS) {

	/* base class to draw the dialog contents */
	var _DialogUI = declare("davinci.ui._DialogUI", [_Container, _Widget, _Templated], {
		templateString: dialogTemplateString,
		widgetsInTemplate: true,

		// attach points
		resizeHandle: null,
		contentArea: null,
		actionArea: null,

		// props
		resizeTarget: null,

		postCreate: function() {
			this.inherited(arguments);
			this.resizeHandle.attr("targetId", this.resizeTarget);
		},

		resize: function(coords) {
			if (coords) {
				if (coords.w) {
					dojo.style(this.contentArea, "width", coords.w+"px");
				}

				if (coords.h) {
					dojo.style(this.contentArea, "height", this._calculateContentHeight(coords.h)+"px");
				}
			}

			// resize children
			dojo.forEach(this.getChildren(), function(child) {
					if (child.resize) {
						child.resize(coords);
					}
			});
		},

		_calculateContentHeight: function(totalHeight) {
			var h = totalHeight;

			h -= dojo.marginBox(this.actionArea).h;
			return h;
		}
	});

return declare("davinci.ui.Dialog", Dialog, {
	contentStyle: null,

	buildRendering: function() {
		this.inherited(arguments);

		// append to containerNode
		var div = dojo.doc.createElement("div");
		this.containerNode.appendChild(div);

		this.dialogUI = new _DialogUI({buttons: this.buttons, resizeTarget: this.id}, div);
		this._oldContainerNode = this.containerNode;
		this.containerNode = this.dialogUI.contentArea;
	},

	_setContent: function(cont, isFakeContent) {
		// remove buttons and place them in the correct place
		if(!dojo.isString(cont)) {
			var n = dojo.query(".dialogButtonContainer", cont.domNode ? cont.domNode : cont)[0];
			if (n) {
				var n2 = n.parentNode.removeChild(n);
				this.dialogUI.actionArea.appendChild(n2);
			}
		}

		this.inherited(arguments);
	},

	resize: function(coords) {
		var titleBarHeight = dojo.marginBox(this.titleBar).h;

		if (coords) {
			// compute paddings
			var computedStyle = style.getComputedStyle(this._oldContainerNode);
			var output = domGeometry.getPadExtents(this._oldContainerNode, computedStyle);

			var c = {w: coords.w-output.w, h: coords.h-output.h}
			c.h -= dojo.marginBox(this.titleBar).h;
			this.dialogUI.resize(c);
		}
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
				this.dialogUI.resize(r);
			}
			this.layout();
		}

		return result;
	}
});
});

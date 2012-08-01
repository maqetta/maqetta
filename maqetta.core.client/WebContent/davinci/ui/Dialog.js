define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_Container",
	"dijit/form/Button",
	"dijit/Dialog",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/_base/connect",
	"dojo/text!./templates/Dialog.html",
	"dojo/i18n!davinci/ve/nls/common",
	"dojox/layout/ResizeHandle"
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, Button, Dialog, domGeometry, style, connect,
		dialogTemplateString, veNLS, ResizeHandle) {

var DialogClass = declare(Dialog, {
	contentStyle: null,

	buildRendering: function() {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "resizableDialog");

		dojo.connect(this.domNode, "onkeydown", this, "_onKeyDown");
	},

	_setContent: function(cont, isFakeContent) {
		this.inherited(arguments);

		var div = dojo.doc.createElement("div");
		this.containerNode.appendChild(div);

		new ResizeHandle({targetId: this.id}, div);
	},

	resize: function(coords) {
		var titleBarHeight = domGeometry.getMarginBox(this.titleBar).h;

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

			// reposition after changing sizes
			this._position();

//			this.layout();  //TODO: method disappeared in 1.8.0b1
		}

		return result;
	},

	_onKeyDown: function(e) {
		var hasAccel = ((e.ctrlKey && !dojo.isMac) || (dojo.isMac && e.metaKey))

		if (hasAccel && e.which == dojo.keys.ENTER) {
			// accel enter submits a dialog.  We do this by looking for a submit input
			// and faking a mouse click event.
			var submitButtons = dojo.query("input[type=submit]", this.containerNode);

			if (submitButtons.length > 0) {
				var b = dijit.getEnclosingWidget(submitButtons[0]);

				var evt = document.createEvent("MouseEvents");
				evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false,
						false, 0, null);
				b._onClick(evt);
			}
		}
	}
});

// static helper methods

DialogClass.showModal = function(content, title, style, callback) {
	var handles = [];

	var myDialog = new DialogClass({
		title: title,
		content: content,
		contentStyle: style
	});

	handles.push(connect.connect(myDialog, "onExecute", content, function() {
		var cancel = false;
		if (callback) {
			cancel = callback();
		}

		if (cancel) {
			return;
		}

		handles.forEach(connect.disconnect);

		myDialog.destroyRecursive();
	}));

	function _destroy() {
		handles.forEach(connect.disconnect);

		myDialog.destroyRecursive();
	}

	handles.push(connect.connect(content, "onClose", function() {
		_destroy();
	}));

	// handle the close button
	handles.push(connect.connect(myDialog, "onCancel", function() {
		_destroy();
	}));

	myDialog.show();

	return myDialog;
},

// simple dialog with an automatic OK button that closes it.
DialogClass.showMessage = function(title, message, style, callback) {
	return this.showDialog(title, message, style, callback, null, true);
},

// OK/Cancel dialog with a settable okLabel
DialogClass.showDialog = function(title, content, style, callback, okLabel, hideCancel) {
	var myDialog;
	var handles = [];

	function _onCancel() {
		handles.forEach(connect.disconnect);
		myDialog.destroyRecursive();
	}

	// construct the new contents
	var newContent = document.createElement("div");

	var dialogContents = document.createElement("div");
	dojo.addClass(dialogContents, "dijitDialogPaneContentArea");
	if (dojo.isString(content)) {
		dialogContents.innerHTML = content;
	} else {
		dialogContents.appendChild(content.domNode);
	}
	newContent.appendChild(dialogContents);

	var dialogActions = document.createElement("div");
	dojo.addClass(dialogActions, "dijitDialogPaneActionBar");
	dialogActions.appendChild(new Button({label: okLabel ? okLabel : veNLS.ok, type: "submit"}).domNode);

	if (!hideCancel) {
		dialogActions.appendChild(new Button({label: veNLS.cancel, onClick: _onCancel}).domNode);
	}

	newContent.appendChild(dialogActions);

	myDialog = new DialogClass({
		title: title,
		content: newContent,
		contentStyle: style
	});

	handles.push(connect.connect(myDialog, "onExecute", function() {
		if (callback) {
			callback();
		}

		_onCancel();
	}));

	handles.push(connect.connect(myDialog, "onCancel", function() {
		_onCancel();
	}));

	myDialog.show();

	return myDialog;
}

return DialogClass;
});

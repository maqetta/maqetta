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
	"dojo/window",
	"dojo/text!./templates/Dialog.html",
	"dojo/i18n!davinci/ve/nls/common",
	"dojox/layout/ResizeHandle",
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, Button, Dialog, domGeometry, style, connect, winUtils,
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
		if (coords) {
			// compute paddings
			var computedStyle = style.getComputedStyle(this.containerNode);
			var output = domGeometry.getPadExtents(this.containerNode, computedStyle);

			var c = {w: coords.w-output.w, h: coords.h-output.h}
			c.h -= domGeometry.getMarginBox(this.titleBar).h;

			var contentArea = dojo.query(".dijitDialogPaneContentArea", this.containerNode)[0];
			var actionArea = dojo.query(".dijitDialogPaneActionBar", this.containerNode)[0];

			// subtract actionbar area
			c.h -= domGeometry.getMarginBox(actionArea).h;

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

				var viewport = winUtils.getBox(this.ownerDocument);
				viewport.w *= this.maxRatio;
				viewport.h *= this.maxRatio;

				if (r.h > viewport.h) {
					var containerSize = domGeometry.position(this.containerNode),
						w = Math.min(r.w, viewport.w) - (r.w - containerSize.w),
						h = Math.min(r.h, viewport.h) - (r.h - containerSize.h);
						r.h = viewport.h;
				}

				this.resize(r);
			}

			// reposition after changing sizes
			this._size();
			this._position();

			// clear any containerNode specific dimensions ot make resize work
			dojo.style(this.containerNode, "width", "auto");
			dojo.style(this.containerNode, "height", "auto");

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
DialogClass._timedDestroy = function(dialog, handles) {
	if (handles) {
		handles.forEach(connect.disconnect);
	}

	// Timing situation here where we destroy the dialog before its fadeout animation
	// completes which will throw an exception.  So we listen to onHide to know
	// the dialog has finished hiding itself before we destroy it.
	var hndl = connect.connect(dialog, "onHide", function() {
		dialog.destroyRecursive();
		connect.disconnect(hndl);
	});

	dialog.hide();
}

DialogClass.showModal = function(content, title, style, callback) {
	var handles = [];

	var myDialog = new DialogClass({
		title: title,
		content: content,
		contentStyle: style
	});

	var _onExecute = dojo.hitch(this, function() {
		var cancel = false;
		if (callback) {
			cancel = callback();
		}

		if (cancel) {
			return;
		}

		this._timedDestroy(myDialog, handles);
	});

	handles.push(connect.connect(myDialog, "onExecute", content, _onExecute));

	if (content.onExecute) {
		handles.push(connect.connect(content, "onExecute", content, _onExecute));
	}

	handles.push(connect.connect(content, "onClose", dojo.hitch(this, function() {
		this._timedDestroy(myDialog, handles);
	})));

	// handle the close button
	handles.push(connect.connect(myDialog, "onCancel", dojo.hitch(this, function() {
		this._timedDestroy(myDialog, handles);
	})));

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

	// construct the new contents
	var newContent = document.createElement("div");

	var dialogContents = document.createElement("div");
	dojo.addClass(dialogContents, "dijitDialogPaneContentArea");

	newContent.appendChild(dialogContents);

	var dialogActions = document.createElement("div");
	dojo.addClass(dialogActions, "dijitDialogPaneActionBar");
	dialogActions.appendChild(new Button({label: okLabel ? okLabel : veNLS.ok, type: "submit"}).domNode);

	var _onCancel = dojo.hitch(this, function() {
		this._timedDestroy(myDialog, handles);
	});

	if (!hideCancel) {
		dialogActions.appendChild(new Button({label: veNLS.cancel, onClick: _onCancel}).domNode);
	}

	newContent.appendChild(dialogActions);

	myDialog = new DialogClass({
		title: title,
		content: newContent,
		contentStyle: style
	});

	// Add the content here to avoid building the widgets twice
	if (dojo.isString(content)) {
		dialogContents.innerHTML = content;
	} else {
		dialogContents.appendChild(content.domNode);
	}

	handles.push(connect.connect(myDialog, "onExecute", dojo.hitch(this, function() {
		if (callback) {
			callback();
		}

		_onCancel();
	})));

	handles.push(connect.connect(myDialog, "onCancel", dojo.hitch(this, function() {
		_onCancel();
	})));

	myDialog.show();

	return myDialog;
}

return DialogClass;
});

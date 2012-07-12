define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_Container",
	"dijit/form/Button",
	"dijit/Dialog",
	"dijit/form/Button",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/text!./templates/Dialog.html",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojox/layout/ResizeHandle"
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, Button, Dialog, domGeometry, style, dialogTemplateString, veNLS) {

var DialogClass = declare("davinci.ui.Dialog", Dialog, {
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

	handles.push(dojo.connect(myDialog, "onExecute", content, function() {
		var cancel = false;
		if (callback) {
			cancel = callback();
		}

		if (cancel) {
			return;
		}

		dojo.forEach(handles, function(handle){dojo.disconnect(handle)});

		myDialog.destroyRecursive();
	}));

	function _destroy() {
		dojo.forEach(handles, function(handle){dojo.disconnect(handle)});

		myDialog.destroyRecursive();
	}

	handles.push(dojo.connect(content, "onClose", function() {
		_destroy();
	}));

	// handle the close button
	handles.push(dojo.connect(myDialog, "onCancel", function() {
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
		dojo.forEach(handles, function(handle){dojo.disconnect(handle)});

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

	handles.push(dojo.connect(myDialog, "onExecute", function() {
		if (callback) {
			callback();
		}

		_onCancel();
	}));

	handles.push(dojo.connect(myDialog, "onCancel", function() {
		_onCancel();
	}));

	myDialog.show();

	return myDialog;
}

return DialogClass;
});

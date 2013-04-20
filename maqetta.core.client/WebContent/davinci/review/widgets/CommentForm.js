define([
	"dojo/_base/declare",
	"dijit/_Widget",
	"dijit/_Templated",
	"dijit/form/TextBox",
	"dijit/form/SimpleTextarea",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dojo/i18n!./nls/widgets",
	"davinci/Runtime",
	"dojo/text!./templates/CommentForm.html"
], function(declare, _Widget, _Templated, TextBox, SimpleTextarea, Menu, MenuItem, 
		Button, DropDownButton, widgetsNls, Runtime, templateString) {

return declare("davinci.review.widgets.CommentForm", [_Widget, _Templated], {

	templateString: templateString,

	postMixInProperties: function() {
		this.inherited(arguments);

		// add to 'this' for template substitutions
		this.comment = widgetsNls.comment;
		this.buttonCancel = widgetsNls.buttonCancel;
	},

	postCreate: function() {
		this.subject = new TextBox({
			placeHolder: widgetsNls.subjectPlaceHolder,
			style: "width: 100%"
		}, this.subjectNode);
		this.content = new SimpleTextarea({
			rows: 4,
			style: "width: 100%; margin: 2px 0px 2px 0px;font-family:Verdana, Arial, Helvetica, sans-serif;font-size:100%;"
		}, dojo.create("div"));
		this.contentNode.appendChild(this.content.domNode);
		new Button({
			label: widgetsNls.submit, 
			onClick: dojo.hitch(this, "_submit")
		}, this.submitNode);

		this.replyTo = "root";
		this.connect(this.cancelNode, "click", "hide");
		this.connect(this.content, "onFocus", "hidePlaceHolder");
		this.connect(this.content, "onBlur", "showPlaceHolder");
		this.connect(this.placeHolder, "click", function() {
			this.hidePlaceHolder();
			this.content.focus();
		});

		var viewActions=this._getActions();
		var tb=dojo.create("span", {style: {display: "inline-block"}},this.toolbarNode);
		var toolbar = this._toolbar = davinci.Workbench._createToolBar('toolbarPath', tb, viewActions, this);
		dojo.style(toolbar.domNode,{"display":"inline-block"});
		
		//Subscribe to changes to the selection state of shapes in the review editor
		dojo.subscribe("/davinci/review/drawing/selectshape", this, function(selectedShape, surface) {
			this._updateToolbarEnablement();
		}.bind(this));
		
		dojo.subscribe("/davinci/review/drawing/deselectshape", this, function(selectedShape, surface) {
			this._updateToolbarEnablement();
		}.bind(this));
	},
	
	_updateToolbarEnablement: function() {
		var toolbarChildren = this._toolbar.getChildren();
		dojo.forEach(toolbarChildren, function(child) {
			var childAction = child._maqAction;
			if (childAction && childAction.action && childAction.action.isEnabled) {
				var enabled = childAction.action.isEnabled();
				child.set("disabled", !enabled);
			}
		});
	},

	_getActions: function() {
		var editorActions = [];
		Runtime.getExtensions("davinci.annotationActions", function(ext) {
			editorActions.push(ext.editorContribution);
			return true;
		});
		return editorActions;
	},

	hide: function() {
		this.isShowing = false;
		this.onHide();
		dojo.style(this.domNode, "display", "none");
		this.reset();
		dojo.publish("/davinci/review/view/closeComment", []);
	},

	onHide: function() {
		// Placeholder
	},

	show: function() {
		this.isShowing = true;
		this.onShow();
		dojo.style(this.domNode, "display", "block");
		dojo.window.scrollIntoView(this.domNode);
		dojo.publish("/davinci/review/view/openComment", []);
		
		//Initialize toolbar enablement
		this._updateToolbarEnablement();
	},

	onShow: function() {
		// Placeholder
	},

	_submit: function() {
		var subject = this.subject.get("value"),
		content = this.content.get("value"),
		func = this._update ? "onUpdate" : "onSubmit";

		this[func]({
			subject: subject,
			content: content
		});

	},

	onSubmit: function(args) {
		// Placeholder to be connected
	},

	onUpdate: function(args) {
		// Placeholder to be connected
	},

	reset: function() {
		dojo.style(this.subject.domNode, "display", "block");
		this.placeHolder.innerHTML = widgetsNls.comment;
		this.showPlaceHolder();
		this.subject.set("value", "");
		this.content.set("value", "");
		this.replyTo = "root";
		this.placeAt(this.parentNode, "first");
		this._update = false;
		this.isShowing = false;
		this.editFrom = null;
	},

	/**
	 * When the comment form firstly shows, the text hint should be "Enter comment here", in grey color.
	 * @returns
	 */
	showPlaceHolder : function() {
		if (this.content.get("value") == "") {
			dojo.removeClass(this.placeHolder,"davinciReviewHide");
		}
	},

	hidePlaceHolder: function() {
		dojo.addClass(this.placeHolder,"davinciReviewHide");
	},

	setReplyMode: function() {
		dojo.style(this.subject.domNode, "display", "none");
		this.placeHolder.innerHTML = widgetsNls.commentReply;
	},

	setEditMode: function() {
		this._update = true;
	},

	moveTo: function(/*DomNode*/ parent) {
		if (!this.parentNode) {
			this.parentNode = parent;
		}
		this.placeAt(parent);
	}

});
});
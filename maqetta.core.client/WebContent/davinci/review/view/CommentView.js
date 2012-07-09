define([
	"dojo/_base/declare",
	"davinci/Workbench",
	"davinci/Runtime",
	"davinci/review/Review",
	"davinci/workbench/ViewPart",
	"davinci/review/widgets/Comment",
	"davinci/review/widgets/CommentForm",
	"dijit/form/Button",
	"dijit/form/TextBox",
	"dijit/form/DropDownButton",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"dijit/CheckedMenuItem",
	"dijit/MenuSeparator",
	"dijit/Dialog",
	"dijit/Menu",
	"dojo/fx",
    "dojo/i18n!./nls/view",
    "dojo/i18n!davinci/workbench/nls/workbench"
], function(declare, Workbench, Runtime, Review, ViewPart, Comment, CommentForm, Button, TextBox, DropDownButton, 
		Toolbar, ToolbarSeparator, CheckedMenuItem, MenuSeparator, Dialog, Menu, coreFx, viewNls, workbenchNls) {

var getNewGuid = function() {
	var guid = "";
	for (var i = 1; i <= 32; i++){
		var n = Math.floor(Math.random()*16.0).toString(16);
		guid += n;
		if((i==8)||(i==12)||(i==16)||(i==20)){
			guid += "-";
		}
	}
	return guid;    
};

return declare("davinci.review.view.CommentView", ViewPart, {

	interval: 33554432,
	id: 0,

	postCreate: function() {
		this.inherited(arguments);
		// A cache that stores all the loaded comments attached to each page
		this._cached = { /*pageName: _comments [state: attr]*/ };
		this._cached.indices = {/*id: _comment*/};
		// Current comment widgets on this view
		this.comments = [];
		this.commentIndices = {
				"0": this
		};
		this._commentConns = [];

		this.container = new dijit.layout.ContentPane();
		this.commentReplies = this.container.domNode;
		dojo.attr(this.commentReplies, "tabindex", "0");
		this.setContent(this.container);
		this._initCommentForm();

		this.connect(this.commentReplies, "keydown", function(evt) {
			var loopBody = function(comment) {
				if (comment.pageState == pageState) {
					comment.enable();
				} else {
					comment.disable();
				}
				var replies = comment.getReplies();
				if (replies.length > 0) {
					dojo.forEach(replies, loopBody);
				}
			};
			if (!this._currentPage) {
				return; //No page is opened
			}
			if (evt.keyCode == dojo.keys.CTRL || evt.keyCode == dojo.keys.META) {
				var focusedComments = this._cached[this._currentPage].focusedComments;
				if (focusedComments.length > 0) {
					var pageState = this.commentIndices[focusedComments[0]].pageState;
					dojo.forEach(this.comments, loopBody);
				}
			}
		});

		this.connect(this.commentReplies, "keyup", function(evt) {
			if (evt.keyCode == dojo.keys.CTRL || evt.keyCode == dojo.keys.META) {
				var loopBody = function(comment) {
					comment.enable();
					var replies = comment.getReplies();
					if (replies.length > 0) {
						dojo.forEach(replies, loopBody);
					}
				};
				dojo.forEach(this.comments, loopBody);
			}
		});

		this.connect(this.commentReplies, "click", function(evt) {
			// Blur all the selected comments
			if (evt.target !== this.commentReplies) {
				return;
			}
			this._blurAllComments();
		});
		
		dojo.subscribe("/davinci/review/view/canvasFocused", this, function() {
			this._blurAllComments();
		});

		dojo.subscribe("/davinci/review/resourceChanged", this, function(arg1,arg2,arg3) {
			if (arg2 != "open" && arg2 != "closed" || !this._currentPage) {
				return;
			}
			if (this._currentPage.split("/")[2] == arg3.timeStamp) {
				this._versionClosed = arg2=="closed";
			}
			dijit.byId("davinciReviewToolbar.Add").set("disabled", this._versionClosed);
			dijit.byId("davinciReviewToolbar.Reviewers").set("disabled", false);
			dojo.publish(this._currentPage+"/davinci/review/drawing/addShape", ["[]", true]);
			this._destroyCommentWidgets();
			this._render();
//FIXME: THIS IS ALL BROKEN WITH NEW STATES/SCENES REGIME
//FIXME: getCurrentScene now takes a container node as a required param
//FIXME: Each saved state/scene needs to be a pair: containerNode + scene/state
//FIXME: Not sure how we are going to identify containers if they don't have IDs. XPath?
			var state = this._cached[this._currentPage].pageState,
				scene = this._cached[this._currentPage].viewScene || this._getCurrentScene().s;
			dojo.publish(this._currentPage+"/davinci/review/drawing/filter", [{pageState: state, viewScene: scene}, []]);

		});

		dojo.subscribe("/davinci/review/context/loaded", this, function(context, pageName){
			context._commentView = this;
			this._context = context;
			
			// summary:
			//		Load the comments when the page is loaded
			//		Collapse all the comments
			//		Enable the action icon on the toolbar
			var global = dojo.window.get(context.containerNode.ownerDocument);

			var designerId = context.resourceFile.parent.designerId;
			this._loadCommentData(designerId, pageName);
			if (Workbench.getOpenEditor() === context.containerEditor) {
				// Only need rendering when it is the current editor
				// No need to render when the editor is opened in the background
				this._currentPage = pageName;
				this._cached[this._currentPage].context = context;
				this._destroyCommentWidgets();
				//FIXME: Hack
				//Postpone updating shapes with setTimeout. Something happened
				//with Preview 4 code where page loading has altered timing.
				var that = this;
				setTimeout(function() {
					that._render();
					that._updateToolbar({editor:context});
					// Show annotations
					that._reviewFilterChanged(); // Set reviewer list to be shown
					dojo.publish(that._currentPage+"/davinci/review/drawing/filter", [{pageState: "Normal", viewScene: that._getCurrentScene().s}, []]);
				}, 100);
			}
			// Response to the state change event in the review editor
			if (global && global.require) {
				var userConnect = global.require("dojo/_base/connect");
				userConnect.subscribe("/maqetta/appstates/state/changed", this, function(args) {
					if (!Runtime.currentEditor || Runtime.currentEditor.editorID != "davinci.review.CommentReviewEditor") { 
						return; 
					}
					var state = args.newState || "Normal";
					this._cached[this._currentPage].pageState = state;
					var scene = this._cached[this._currentPage].viewScene = this._getCurrentScene().s;
					dojo.publish(this._currentPage+"/davinci/review/drawing/filter", [{pageState: state, viewScene: scene}, []]);
				});
			}
			
			var sceneObj = this._getCurrentScene();
			if (sceneObj.s) { // if there is a sceneId in the scene object
				this.setCurrentScene(sceneObj.sm, sceneObj.s);
			}
		});

		dojo.subscribe("/davinci/ui/editorSelected", this, function(args) {
			// summary:
			//		Remove the comment nodes of the previous page
			
			var editor = this._editor = args.editor;

			//save the editing comment form
			if (args.oldEditor && args.oldEditor.basePath) {
				if (this._commentForm.isShowing) {
					var editingComment = {
							commentId : this._commentForm.commentId,
							replyTo: this._commentForm.replyTo,
							subject: this._commentForm.subject.get("value"),
							content: this._commentForm.content.get("value").replace(/\n/g, "<br/>"),
							severity: this._commentForm.severity.containerNode.innerHTML,
							type: dojo.byId(this._commentForm.type.id + "_label" ).innerHTML,
							editFrom: this._commentForm.editFrom
					};
					this._setPendingEditComment(args.oldEditor, editingComment);
				} else {
					//Clear out editing comment
					this._setPendingEditComment(args.oldEditor, null);
				}
			}
			if (editor && editor.basePath) {
				this._currentPage = editor.basePath.path;
				this._commentForm.hide();
				this._destroyCommentWidgets();
				this._updateToolbar(args);
				this._render();

				var focusedComments = this._cached[this._currentPage] && this._cached[this._currentPage].focusedComments;
				if (focusedComments) {
					dojo.forEach(focusedComments,dojo.hitch(this,function(commentId) {
						this.commentIndices[commentId].focusComment({ctrlKey:true, metaKey:true, silent: true});
					}));
				}

				//restore the commentForm
				if (this._cached[this._currentPage] && this._cached[this._currentPage].editComment) {
					var form = this._commentForm,
					editComment = this._cached[this._currentPage].editComment;

					form.reset();
					form.commentId = editComment.commentId;
					form.subject.set("value", editComment.subject);
					form.content.set("value", editComment.content.replace(/<br\/>/g,"\n"));
					if(editComment.content) form.hidePlaceHolder();
					form.setTypeButtonLabel(editComment.type);
					form.setSeverityButtonLabel(editComment.severity);
					var comment;
					if (editComment.replyTo !== 0) {
						form.setReplyMode();
						form.replyTo = editComment.replyTo;
						comment = this.commentIndices[editComment.replyTo];
						form.moveTo(comment.tempForm);
						var parent = comment;
						while (parent && parent.expand) {
							// Expand the comment if the parent of the comment is collapsed
							parent.expand();
							parent = this.commentIndices[parent.replyTo];
						}
						dojo.window.scrollIntoView(comment.domNode);

					}
					if (editComment.editFrom) {
						form.setEditMode();
						comment = this.commentIndices[editComment.editFrom];
						comment.hide();
						form.moveTo(comment.tempForm);
						dojo.window.scrollIntoView(comment.domNode);
					}

					form.show();
				}
			} 
			
			if (!editor || editor.editorID != "davinci.review.CommentReviewEditor") {
				// If there's no new editor (indicating all editors have been closed and 
				// user accepted the close tab warning if applicable) OR if the new editor 
				// isn't a review editor, let's clear out the comment view
				this._resetCommentView();
				this._currentPage = null;
			} else {
				this._versionClosed = editor.resourceFile.parent.closed;
			}
		});

		dojo.subscribe("/davinci/review/drawing/annotationSelected", this, function(commentId, selected) {
			var comment = this.commentIndices[commentId];
			var focusedComments = this._cached[this._currentPage].focusedComments;
			if (comment && !comment.isFocused || focusedComments.length > 1) {
				var parent = this.commentIndices[comment.replyTo];
				while (parent && parent.expand) {
					// Expand the comment if the parent of the comment is collapsed
					parent.expand();
					parent = this.commentIndices[parent.replyTo];
				}
				dojo.window.scrollIntoView(comment.domNode);
				comment.focusComment();
				this._flash(comment.getBody());
			} else if(comment) {
				comment.blurComment();
			}
		});

		dojo.subscribe("/davinci/review/commentStatusChanged", this, function(comment, status) {
			var focusedComments = this._cached[this._currentPage].focusedComments;
			var designerId = this._getDesignerId();
			this._loadCommentData(designerId, this._currentPage);
			var loopBody = function(comment){
				comment.status = status;
				var replies = comment.getReplies();
				comment.refresh();
				if(replies&&replies.length > 0){
					dojo.forEach(replies, loopBody);
				}
			};
			loopBody(comment);
			// Recover the value with the old array
			this._cached[this._currentPage].focusedComments = focusedComments;
		});

		dojo.subscribe("/davinci/review/commentAddedError",this,this._onErrorCreateNewComment);
	},

	_getCurrentScene: function() {
		// summary:
		//		Return a scene object with sm (SceneManager) and s (current scene) values
		
		// If any plugin SceneManagers, get the current scene
		var sceneManagers = this._context.sceneManagers;
		var sceneId;
		for (var smIndex in sceneManagers) {
			var sm = sceneManagers[smIndex];
			if (sm.getCurrentScene) {
				sceneId = sm.getCurrentScene();
				if (sceneId) {
					break;
				}
			}
		}
		return {sm: sm, s: sceneId};
	},

	_setPendingEditComment: function(editor, editingComment) {
		//Determine the cache key based on type of "editor" arg
		var key = null;
		if (typeof editor === "string") {
			key = editor;
		} else if (editor.basePath && editor.basePath.path) {
			key = editor.basePath.path;
		}
		
		//Look up any pending comment based on the key and
		//set the comment
		if (key) {
			var cachedVal = this._cached[key];
			if (cachedVal) {
				cachedVal.editComment = editingComment;
			}
		}
	},

	_resetCommentView: function() {
		dijit.byId("davinciReviewToolbar.Add").set("disabled", true);
		dijit.byId("davinciReviewToolbar.Reviewers").set("disabled",true);
		this._commentForm.hide();
		this._destroyCommentWidgets();
	},

	_initCommentForm: function() {
		// summary:
		//		Create the comment form and initialize it
		var form = this._commentForm = new CommentForm({
			onSubmit: dojo.hitch(this, "_onCreateNewComment"),
			onUpdate: dojo.hitch(this, "_onUpdateComment"),
			onShow: dojo.hitch(this, "_onCommentFormShown")
		});
		this.connect(form.cancelNode, "click", "_onCommentFormCancel");
		form.moveTo(this.container.domNode);
		form.hide();
	},

	_onCommentFormShown: function() {
	},

	_onErrorCreateNewComment: function(comment) {
		var _comments = this._cached[this._currentPage];
		var index;
		var i;
		for (i=0; i<_comments.length; i++) {
			if (_comments[i] && _comments[i].id == comment.commentId) {
				index = i;
			}
			_comments[i]._hasPopulate = false;
		}

		if (index) {
			_comments.splice(index, 1);
		}
		delete this._cached.indices[comment.commentId];
		this._destroyCommentWidgets();
		dojo.publish(this._currentPage+"/davinci/review/drawing/addShape", ["[]", true]);
		this._render();
	},

	_onCreateNewComment: function(args) {
		var form = this._commentForm,
		_comments = this._cached[this._currentPage] || [];

		// Get drawing JSON string
		dojo.publish(this._currentPage+"/davinci/review/drawing/getShapesInEditing", 
				[this, this._cached[this._currentPage].pageState, (this._cached[this._currentPage].viewScene || this._getCurrentScene().s)]);

		var comment = new Comment({
			commentId: form.commentId,
			subject: args.subject,
			content: args.content,
			designerId: this._getDesignerId(),
			pageName: this._currentPage,
			pageState: this._cached[this._currentPage].pageState,
			viewScene: this._cached[this._currentPage].viewScene || this._getCurrentScene().s,
			ownerId: Runtime.userName,
			//email: Runtime.getDesignerEmail(),
			replyTo: form.replyTo,
			drawingJson: this.drawingJson,
			type: args.type,
			severity: args.severity,
			status: "Open", // By default, the status of a new comment is open.
			closed: this._versionClosed
		});
		this._commentConns.push(
				dojo.connect(comment, "onNewReply", this, "_onNewReply"),
				dojo.connect(comment, "onEditComment", this, "_onEditComment"),
				dojo.connect(comment, "onCommentFocus", this, "_onCommentFocus"),
				dojo.connect(comment, "onCommentBlur", this, "_onCommentBlur")
		);

		this.commentIndices[comment.commentId] = comment;
		form.hide();
		var parent = this.commentIndices[comment.replyTo];
		parent.appendReply(comment);
		if (parent.expand) {
			parent.expand();
		}
		// Make sure the focus is at the bottom of review panel after adding a new comment. 
		dojo.window.scrollIntoView(comment.domNode);
		comment.focusComment();
		this._flash(comment.getBody());

		// Update the cache finally
		var _comment = {
				id: comment.commentId,
				subject: comment.subject,
				content: comment.content,
				pageName: comment.pageName,
				pageState: comment.pageState,
				viewScene: comment.viewScene,
				ownerId: comment.ownerId,
				email: comment.email,
				depth: comment.depth,
				replyTo: comment.replyTo,
				drawingJson: comment.drawingJson,
				type: comment.type,
				severity: comment.severity,
				status: comment.status
		};
		_comments.push(_comment);
		this._cached.indices[_comment.id] = _comment;
	},

	_onUpdateComment: function(args) {
		// summary:
		//		Update the new data to the server
		var form = this._commentForm,
		comment = this.commentIndices[form.commentId];

		// Get drawing JSON string
		dojo.publish(this._currentPage+"/davinci/review/drawing/getShapesInEditing", 
				[this, this._cached[this._currentPage].pageState, (this._cached[this._currentPage].viewScene || this._getCurrentScene().s)]);

		comment.subject = args.subject;
		comment.content = args.content;
		comment.type = args.type;
		comment.severity = args.severity;
		comment.pageState = this._cached[this._currentPage].pageState;
		comment.viewScene = this._cached[this._currentPage].viewScene  || this._getCurrentScene().s;
		comment.drawingJson = this.drawingJson;
		form.hide();
		comment.update();
		comment.show();
		this._flash(comment.getBody());

		// Update the cache finally
		var _comment = this._cached.indices[comment.commentId];
		_comment.subject = comment.subject;
		_comment.content = comment.content; 
		_comment.type = comment.type;
		_comment.severity = comment.severity;
		_comment.pageState = comment.pageState;
		_comment.viewScene = comment.viewScene;
		_comment.drawingJson = comment.drawingJson;
		_comment.status = comment.status;
	},

	_loadCommentData: function(/*String*/ ownerId, /*String*/ pageName) {
		// summary:
		//		Load the comments attached to the opened page
		//		and sort them by time order
		var location = Workbench.location().match(/http:\/\/.*:\d+\//);
		this._cached[pageName] = Runtime.serverJSONRequest({
			url: location + "maqetta/cmd/getComments",
			sync: true,
			content:{
				ownerId: ownerId,
				pageName: pageName
			}
		}).sort(function(c1,c2){
			return c1.created > c2.created ? 1 : c1.created < c2.created ? -1 : 0;
		});
		this._cached[pageName].pageState = "Normal";
//		this._cached[pageName].viewScene = "";
		this._cached[pageName].focusedComments = [];
	},

	_destroyCommentWidgets: function() {
		// summary:
		//		Destroy the comment widgets
		var comments = this.comments;
		dojo.forEach(comments, function(comment) {
			comment.destroyRecursive();
		});
		this.comments = [];
		dojo.forEach(this._commentConns, dojo.disconnect);
		this._commentConns = [];
	},

	_render: function() {
		var _comments = this._cached[this._currentPage];
		dojo.forEach(_comments, function(_comment, i) {
			var comment = new Comment({
				commentId: _comment.id,
				subject: _comment.subject,
				content: _comment.content,
				designerId: _comment.designerId,
				pageName: this._currentPage,
				pageState: _comment.pageState,
				viewScene: _comment.viewScene,
				ownerId: _comment.ownerId,
				email: _comment.email,
//				depth: parseInt(_comment.depth),
//				order: parseFloat(_comment.order),
				created: _comment.created,  
				parent: this,
				existed: true,
				replyTo: _comment.replyTo,
				drawingJson: _comment.drawingJson,
				type: _comment.type,
				status: _comment.status,
				severity: _comment.severity,
				closed: this._versionClosed
			});
			// Build comment data indices, we need this when update the comments
			this._cached.indices[_comment.id] = _comment;
			// Add to the comment indices and append the comment as a reply of
			// the comment identified by the replyTo attribute
			this.commentIndices[comment.commentId] = comment;
			this.commentIndices[comment.replyTo].appendReply(comment);

			this._commentConns.push(
					dojo.connect(comment, "onNewReply", this, "_onNewReply"),
					dojo.connect(comment, "onEditComment", this, "_onEditComment"),
					dojo.connect(comment, "onCommentFocus", this, "_onCommentFocus"),
					dojo.connect(comment, "onCommentBlur", this, "_onCommentBlur")
			);

			if (i === 0) {
				dojo.style(comment.domNode, "borderTop", "none");
			}

			// Populate the shapes
			if (!_comment._hasPopulate) {
				dojo.publish(this._currentPage+"/davinci/review/drawing/addShape", [comment.drawingJson]);
				_comment._hasPopulate = true;
			}
		}, this);
		dojo.forEach(this.comments, function(comment) {
			comment.collapse(true);
		});

	},

	_onEditComment: function(args) {
		var form = this._commentForm,
		comment = this.commentIndices[args.commentId];

		if (comment.ownerId != Runtime.userName) { 
			return;
		}

		if (form.isShowing) {
			// The form is open, we need to do some cleaning.
			this._onCommentFormCancel();
		}

		form.reset();
		form.commentId = args.commentId;
		form.subject.set("value", comment.subject);
		form.content.set("value", comment.content.replace(/<br\/>/g,"\n"));
		if(comment.content) form.hidePlaceHolder();
		form.setTypeButtonLabel(comment.type);
		form.setSeverityButtonLabel(comment.severity);
		form.setEditMode();
		if(comment.isReply()){
			form.setReplyMode();
		}
		form.replyTo = comment.replyTo;
		comment.hide();
		form.moveTo(comment.tempForm);
		form.editFrom = args.commentId;
		form.show();

		// Notify the drawing tool to be in edit mode
		dojo.publish(this._currentPage+"/davinci/review/drawing/enableEditing", 
				[
				 Runtime.userName,
				 form.commentId,
				 comment.pageState,
				 comment.viewScene
		]);
	},

	_onNewReply: function(args) {
		var form = this._commentForm;

		if (form.isShowing) {
			this._onCommentFormCancel();
		}

		form.reset(); // Ensure that the form is restored
		form.commentId = getNewGuid();
		form.setReplyMode();
		form.replyTo = args.replyTo;
		form.subject.set("value", args.subject);
		var comment = this.commentIndices[args.replyTo];
		form.moveTo(comment.tempForm);
		form.show();

		// Notify the drawing tool to be in edit mode
		dojo.publish(this._currentPage+"/davinci/review/drawing/enableEditing", 
				[
				 Runtime.userName,
				 form.commentId,
				 this._cached[this._currentPage].pageState,
				 this._cached[this._currentPage].viewScene
		]);
	},

	_onCommentFocus: function(widget, evt) {
		var focusedComments = this._cached[this._currentPage].focusedComments;
		if (!evt || (!evt.ctrlKey && !evt.metaKey)) {
			dojo.forEach(focusedComments, function(commentId) {
				this.commentIndices[commentId].blurComment(true);
			}, this);
			focusedComments.length = 0;
			focusedComments.push(widget.commentId);
		} else if (evt.ctrlKey || evt.metaKey) {
			if (!dojo.some(focusedComments, function(commentId){ return commentId == widget.commentId; })) {
				focusedComments.push(widget.commentId);
			}
		}

		if (!evt || !evt.silent) {
			if(this._editor){
				var context = this._editor.getContext();
				var states = (context && context.rootNode && context.rootNode.ownerDocument && 
						context.rootNode.ownerDocument.defaultView &&
						context.rootNode.ownerDocument.defaultView.davinci &&
						context.rootNode.ownerDocument.defaultView.davinci.states);
				if(states){
//FIXME: This isn't working yet with nested state containers.
					states.setState(widget.pageState);
				}
			}
			//FIXME: R/C is stashing away pageState and viewScene on a DOM node
			//This is worrisome - at a minimum, the properties should use a Maqetta prefix of some sort
			//to prevent future collisions.
			//But more important is that we really need to add a SceneManager pointer, too
			//For time being, assume SceneManager from getCurrentScene is same as SceneManager for domNode.viewScene
			var viewScene;
			var currentScene = this._getCurrentScene();
			if(currentScene && currentScene.sm && currentScene.sm.selectScene && widget.viewScene){
				currentScene.sm.selectScene({sceneId:widget.viewScene});
				viewScene = widget.viewScene;
			}
			this.publish(this._currentPage + "/davinci/review/drawing/filter", [{pageState: this._cached[this._currentPage].pageState, viewScene: viewScene}, focusedComments]);
		}
	},

	_onCommentBlur: function(widget) {
		var focusedComments = this._cached[this._currentPage].focusedComments;
		var i;
		for (i = 0; i < focusedComments.length; i++) {
			if (focusedComments[i] == widget.commentId) {
				if (i == focusedComments.length - 1) {
					focusedComments.pop();
				} else { 
					focusedComments[i] = focusedComments.pop();
				}
			}
		}
		var viewScene = this._cached[this._currentPage].viewScene || this._getCurrentScene().s;
		this.publish(this._currentPage+"/davinci/review/drawing/filter", [{pageState: this._cached[this._currentPage].pageState, viewScene: viewScene}, focusedComments]);
	},

	_onCommentFormCancel: function() {
		dojo.publish(this._currentPage+"/davinci/review/drawing/cancelEditing", []);
		var dim = this._cached[this._currentPage],
		pageState = dim.pageState,
		viewScene = dim.viewScene,
		focusedComments = dim.focusedComments;
		if (focusedComments.length > 0) {
			this.commentIndices[focusedComments[0]].show();
		}
		dojo.publish(this._currentPage+"/davinci/review/drawing/filter", [{pageState: pageState, viewScene: viewScene}, focusedComments]);
	},

	_updateToolbar: function(args) {
		dijit.byId("davinciReviewToolbar.Add").set("disabled", this._versionClosed);
		dijit.byId("davinciReviewToolbar.Reviewers").set("disabled", false);
		var editor = args.editor;

		if (editor && editor.resourceFile) {
			var item = editor.resourceFile.parent;
			var reviewers = item.reviewers;
			var comments = this._cached[this._currentPage];
			dojo.forEach(comments, function(comment) {
				if (!dojo.some(reviewers, function(item) {
					return item.email == comment.email;
				}) && Runtime.userName != item.name)
					reviewers.push({
						name: comment.ownerId,
						email: comment.email
					});
			});
			var children = this.reviewerList.getChildren();
			var i;
			for (i = 2 ; i < children.length; i++) {
				children[i].destroy();
			}

			Runtime.reviewers = reviewers;
			dojo.forEach(reviewers, dojo.hitch(this, function(reviewer, index) { 
				//If no name, probably not a Maqetta user and no way they could have comments yet (so color irrelevant)
				if (reviewer.name) { 
					var check = new CheckedMenuItem({
						label: "<div class='davinciReviewToolbarReviewersColor' style='background-color:" + 
						Review.getColor(reviewer.name) +";'></div><span>"+reviewer.name+"</span>",
							onChange: dojo.hitch(this,this._reviewFilterChanged),
							checked: true,
							reviewer:reviewer,
							title: reviewer.email
					});
					this.reviewerList.addChild(check);
					if (this._cached[this._currentPage] && this._cached[this._currentPage].shownColors) {
						var checked = dojo.some(this._cached[this._currentPage].shownColors,function(name) {
							if (name == reviewer.name) return true;
							return false;
						});
						check.set("checked",checked);
					}
				}
			}));
			this._reviewFilterChanged();
		}
	},

	getTopAdditions: function() {
		this.category = "content";
		var filter = new TextBox({
			id: "filterText",
			placeHolder: viewNls.filter
		});
		dojo.connect(filter.domNode, "onkeyup", this, function(e) {
			this._filter();
			dojo.stopEvent(e);
		});

		var toolbar = new Toolbar({id:"davinciReviewToolbar"}, dojo.create("div"));

		// Create the add comment button on the toolbar
		var addBtn = new Button({
			id: toolbar.get("id") + ".Add",
			showLabel: false,
			disabled: true,
			iconClass: "davinciReviewToolbarAdd",
			title: viewNls.addComment,
			onClick: dojo.hitch(this,"_showCommentForm")
		});

		var reviewerList = new Menu({onItemClick: function(/*dijit._Widget*/ item, /*Event*/ evt) {

			if (typeof this.isShowingNow == 'undefined') { 
				this._markActive();
			}
			this.focusChild(item);
			if (item.disabled) { 
				return false;
			}
			if (item.popup) {
				this._openPopup();
			} else {
				item.onClick(evt);
			}
		}});
		reviewerList.addChild(new CheckedMenuItem({
			label:viewNls.allReviewers,
			checked: true,
			onChange: dojo.hitch(this, function(check) {
				var children = reviewerList.getChildren();
				for (var i = 2; i<children.length; i++) {
					children[i].set("checked", check);
				}
				this._reviewFilterChanged();

			})
		}));
		reviewerList.addChild(new MenuSeparator());

		var reviewersBtn = new DropDownButton({
			id: toolbar.get("id") + ".Reviewers",
			showLabel: false,
			disabled: true,
			iconClass: "davinciReviewToolbarReviewers",
			title: viewNls.showReviewer,
			dropDown: reviewerList
		});
		this.reviewerList = reviewerList;

		toolbar.addChild(addBtn);
		toolbar.addChild(new ToolbarSeparator());
		toolbar.addChild(reviewersBtn);
		dojo.place(dojo.create("br"), toolbar.domNode);
		toolbar.addChild(filter);
		/*toolbar.addChild(fitlerTypeDropDown);*/

		return toolbar.domNode;
	},

	_reviewFilterChanged: function() {
		var reviewers = [];
		var children = this.reviewerList.getChildren();
		var i;
		for (i = 2; i<children.length; i++){
			if (children[i].checked) {
				reviewers.push(children[i].reviewer.name);
			}
		}
		//set the select all button.
		children[0].set("checked", reviewers.length == children.length-2);
		if (this._cached[this._currentPage]) {
			this._cached[this._currentPage].shownColors = reviewers;
		}
		dojo.publish(this._currentPage+"/davinci/review/drawing/setShownColorAliases", [reviewers]);
	},	

	_createEditButton : function() {
		if (this.editButton) {
			this.editButton.domNode.style.display = "block";
		} else {
			this.editButton = new Button({
				label: "",
				iconClass: "editButtonIcon",
				disabled: true,
				onClick: dojo.hitch(this, "")
			});
			this.container.domNode.appendChild(this.editButton.domNode);
		}
	},

	_createViewSwitch: function() {
		this.switchWrapper = dojo.create("div",{style:{"float": "right"}});
		var collapse = new Button({
			label: null,
			iconClass: "collapseViewActive",
			onClick: dojo.hitch(this,"collapseAll")
		});
		var expand = new Button({
			label: null,
			iconClass: "expandViewActive",
			onClick: dojo.hitch(this,"expandAll")
		});
		this.switchWrapper.appendChild(collapse.domNode);
		this.switchWrapper.appendChild(expand.domNode);
		this.container.domNode.appendChild(this.switchWrapper);

	},

	_showCommentForm: function() {
		var form = this._commentForm;
		if (form.isShowing) {
			// The form is open, we need to do some cleaning.
			this._onCommentFormCancel();
		}
		form.reset(); // Ensure that the form is restored
		form.commentId = getNewGuid();
		form.show();

		// Notify the drawing tool to be in edit mode
		dojo.publish(this._currentPage+"/davinci/review/drawing/enableEditing", [
			 Runtime.userName,
			 form.commentId,
			 this._cached[this._currentPage].pageState,
			 this._cached[this._currentPage].viewScene
		]);
	},

	_filter: function() {
		var text = dijit.byId("filterText").get("displayedValue");

		dojo.query(".davinciComment", this.container.domNode).removeClass("davinciReviewHide davinciReviewShow").forEach(function(comment) {
			var widget = dijit.getEnclosingWidget(comment);
			var shouldShow = true;
			shouldShow = widget.subjectNode.innerHTML.toLowerCase().indexOf(text.toLowerCase()) >= 0 ||
			widget.contentNode.innerHTML.toLowerCase().indexOf(text.toLowerCase()) >= 0 ||
			widget.ownerName&&widget.ownerName.innerHTML.toLowerCase().indexOf(text.toLowerCase()) >= 0;

			if (shouldShow) {
				dojo.addClass(comment,"davinciReviewShow");
				while (widget.replyTo !== 0) {
					widget = this.commentIndices[widget.replyTo];
					dojo.addClass(widget.domNode,"davinciReviewShow");
					dojo.removeClass(widget.domNode,"davinciReviewHide");
				}
				return;
			}
			dojo.addClass(comment,"davinciReviewHide");
		},this);
	},

	expandAll: function(){ 
		dojo.query(".repliesCount", this.container.domNode).removeClass("davinciReviewShow").addClass("davinciReviewHide");
		dojo.query(".currentScope", this.container.domNode).addClass("davinciReviewShow").removeClass("davinciReviewHide");
	},

	isPageOwner: function() {
		return this._getDesignerId() == Runtime.userName;
	},
	
	_getDesignerId: function() {
		var designerId = null;
		var context = this._cached[this._currentPage].context;
		if (context) {
			designerId = context.resourceFile.parent.designerId;
		}
		return designerId;
	},

	popupWarning: function(description) {
		var dialog = dijit.byId("warningDialog");
		if (!dialog) {
			dialog = new Dialog({
				id: "warningDialog",
				title: "",
				style: "width: 300px"
			}, dojo.create("p", {innerHTML : description}));
		}
		dialog.show();
	},

	getReplies: function() {
		return this.comments;
	},

	appendReply: function(/*davinci.review.widgets.Comment*/ reply) {
		this.comments.push(reply);
		if (this.comments.length == 1) {
			// This is the first reply
			dojo.style(reply.domNode, "borderTop", "none");
		}
		reply.placeAt(this.container.domNode);
	},

	_blurAllComments: function() {
		var focusedComments = this._cached[this._currentPage].focusedComments,
		_candidates = [];
		if (focusedComments) {
			dojo.forEach(focusedComments, function(commentId) {
				var comment = this.commentIndices[commentId];
				comment && _candidates.push(comment);
			}, this);
			dojo.forEach(_candidates, function(c) {
				c.blurComment();
			}, this);
		}
	},

	/**
	 * Make a DOM element shining for a while. The background
	 * color will transfer from one to another and then back.
	 * The duration now is 2 seconds.
	 * 
	 * @param elem
	 *            DOM element.
	 * @returns
	 */
	_flash: function(elem) {
		if (!elem) {
			return;
		}

		if (!this._originalBkColor) {
			this._originalBkColor = dojo.style(elem, "backgroundColor");
		}

		coreFx.chain([dojo.animateProperty({
			node: elem,
			duration: 250,
			properties:{
				backgroundColor:{
					start: this._originalBkColor,
					end: '#fef7d9'
				}
			}
		}), dojo.animateProperty({
			node: elem,
			duration: 250,
			properties:{
				backgroundColor:{
					start: '#fef7d9',
					end: this._originalBkColor
				}
			}
		})]).play();
	},
	
	setCurrentScene: function(SceneManager, sceneId){
		this._cached[this._currentPage].viewScene = sceneId;
		var pageState = this._cached[this._currentPage].pageState;
		var focusedComments = this._cached[this._currentPage].focusedComments;
		dojo.publish(this._currentPage+"/davinci/review/drawing/filter", [{pageState: pageState, viewScene: sceneId}, focusedComments]);
	}
});
});

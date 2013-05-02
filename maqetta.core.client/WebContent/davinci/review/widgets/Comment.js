define([
	"dojo/_base/declare",
	"davinci/XPathUtils",
	"davinci/maqetta/AppStates",
	"davinci/review/Review",
	"davinci/Runtime",
	"davinci/Workbench",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/form/DropDownButton",
	"dojo/date/locale",
	"dojo/date/stamp",
	"dojo/Deferred",
	"dojo/string",
	"dojo/i18n!./nls/widgets",
	"dojo/text!./templates/Comment.html",
	"dojo/text!./templates/MailFailureDialogContent.html"
], function(declare, XPathUtils, AppStates, Review, Runtime, Workbench, _Widget, _Templated, Menu, MenuItem, DropDownButton, locale, stamp, Deferred, dojostring, widgetsNls, commentTemplate, warningString) {

// AppStates functions are only available on the prototype object
var States = AppStates.prototype;

/*
 * Transform the date passed to a relative time against current time on server.
 * E.g. current time is 2010-12-28 4:24:00, time passed: 2010-12-28 4:20:00, then
 * the relative time is "4 mins ago".
 */
//TODO: i18n
var toRelativeTime = function(date, baseDate, threshold) {
	var diff = date.getTime() - baseDate.getTime();
	var direction = diff < 0 ? "ago" : "later";
	var day, hour, min, second;

	diff = Math.floor( Math.abs( diff ) / 1000 );

	if(diff <= 60) return "just now";

	if ( threshold && diff > threshold )
		return locale.format(date, {formatLength:'short',selector:'date'});

	second = diff % 60;
	diff = Math.floor( diff / 60 ); 
	min = diff % 60;
	diff = Math.floor( diff / 60 );
	hour = diff % 24;
	diff = Math.floor( diff / 24 );
	day = diff;

	var timeStr = day ? day + " days ": hour ? hour + " hours ":min ? min + " mins ":'';
	return timeStr + direction;
};

return declare("davinci.review.widgets.Comment", [_Widget, _Templated], {

	templateString: commentTemplate,

	postMixInProperties: function() {
		this.inherited(arguments);
		dojo.mixin(this, widgetsNls);
	},

	VISIBLE_PART_LENGTH: 80, // By default, how many leading characters of the comment will be shown.

	postCreate: function() {
		this._createdPromise = new Deferred();
		if (!this.existed) {
			var urlParams = {
				id: this.commentId,
				subject: this.subject,
				content: this.content,
				ownerId: this.ownerId,
				email: this.email,
				previous: this.previous,
				next: this.next,
				pageState: this.pageState,
				pageStateList: this.pageStateList ? dojo.toJson(this.pageStateList) : '',
				viewScene: this.viewScene,
				viewSceneList: this.viewSceneList ? dojo.toJson(this.viewSceneList) : '',
				designerId: this.designerId,
				pageName: this.pageName,
				replyTo: this.replyTo || "root",
				drawingJson: this.drawingJson
			};
			if (Runtime.currentEditor && Runtime.currentEditor.getContext().getPreference("zazl")) { // FIXME: preferences should be available without going through Context. #3804
				urlParms.zazl = true;
			}

			// Ensure that the comment is created on the server when it is "needed".
			dojo.xhrGet({
				url: "cmd/addComment",
				handleAs: "json",
				content: urlParams,
				error: dojo.hitch(this, function(response) {
					dojo.publish("/davinci/review/commentAddedError", [this]);
					var msg = response.responseText;
					msg = msg.substring(msg.indexOf("<title>")+7, msg.indexOf("</title>"));
					Runtime.handleError(dojo.string.substitute(widgetsNls.errorAddingCom, [response, msg]));
				})
			}).then(dojo.hitch(this, function(result) {
				// We want to grab hold of the creation time from the server
				this.created = result.created;
				
				// Populate the screen with the new comment
				this._populate(this);
				
				// Resolve the promise that the created time stamp is available
				this._createdPromise.resolve(this.created);

				if (result.emailResult && result.emailResult !== 'OK') {
					// Server failed to send an email notification (server is either
					// unreachable or not configured). Display message to user.
					var dialogContent = dojostring.substitute(warningString, {
							htmlContent: result.emailResult,
							inviteNotSent: widgetsNls.commentNotSent,
							mailFailureMsg: widgetsNls.commentMailFailureMsg
					});
					Workbench.showMessage(widgetsNls.warning, dialogContent);
				}
			}.bind(this)));
		} else {
			this._populate(this);
			
			// Resolve the promise that the created time stamp is available
			this._createdPromise.resolve(this.created);
		}

		this.comments = []; // Hold the replies to this comment
		this.collapsed = false;
		this.enabled = true;
		this.focused = false;

		// Populate the comment body
		var color = this.color = Review.getColor(this.email);
		this.subjectNode.innerHTML = this.subject;
		dojo.style(this.subjectNode, "color", color);
		var ownerDisplayName = Runtime.getUserDisplayName({
			email: this.email, 
			userId: this.ownerId,
			userDisplayName: this.displayName
		});
		this.ownerName.innerHTML = ownerDisplayName;
		dojo.style(this.ownerName, "color", color);
		this.contentNode.innerHTML = this.content;
		this._ajustLengthOfCommentContent(true);

		if (this.isReply()) {
			//Let's not show subject line on replies
			dojo.addClass(this.subjectNode, "displayNone");
		}

		this.connect(this.imgNode, "click", "_toggleReplies");
		this.connect(this.replyCountButton, "click", "_toggleReplies");
		this.connect(this.editButton, "click", "_editComment");
		this.connect(this.replyButton, "click", "_newReply");
		this.connect(this.mainBody, "click", "focusComment");
		this.connect(this.mainBody, "dblclick", "_editComment");
		if (this.closed) {
			dojo.style(this.editButton, "display", "none");
			dojo.style(this.replyButton, "display", "none");
		}
		if (Runtime.userName != this.ownerId) {
			dojo.style(this.editButton,"display","none");
		}
	},
	
	// Provide a means for someone to get the created time stamp (which is 
	// created by a server call in postCreate
	getCreated: function() {
		var promise = new Deferred();
		
		this._createdPromise.then(function(created) {
			promise.resolve(created);
		});

		return promise;
	},

	refresh: function() {
		dojo.style(this.editButton, "display", "inline");
		dojo.style(this.replyButton, "display", "inline");
		if (this.closed) {
			dojo.style(this.editButton, "display", "none");
			dojo.style(this.replyButton, "display", "none");
		}
		if (Runtime.userName != this.ownerId) {
			dojo.style(this.editButton, "display", "none");
		}
	},

	_populate: function(result) {
		// summary:
		//		Fill the time, comment order. These info need to be retrieved from the server
		this.createdFormatted = stamp.fromISOString(result.created);
		this.createTime.innerHTML = toRelativeTime(this.createdFormatted, new Date(), 604800);
	},

	update : function(arg) {
		this.subjectNode.innerHTML = this.subject;
		this.contentNode.innerHTML = this.content;
		this._ajustLengthOfCommentContent(true);
		dojo.xhrGet({
			url: "cmd/updateComment",
			handleAs: "json",
			content: {
				id: this.commentId,
				designerId: this.designerId,
				subject:  this.subject,
				content:  this.content,
				pageState: this.pageState,
				pageStateList: this.pageStateList ? dojo.toJson(this.pageStateList) : '',
				viewScene: this.viewScene,
				viewSceneList: this.viewSceneList ? dojo.toJson(this.viewSceneList) : '',
				drawingJson: this.drawingJson
			},
			error: function(response) {
				var msg = response.responseText;
				msg = msg.substring(msg.indexOf("<title>")+7, msg.indexOf("</title>"));
				Runtime.handleError(dojo.string.substitute(widgetsNls.errorUpdateCom, [response, msg]));
			}
		});
	},

	_editComment: function() {
		if (this.isDisabled) {
			return;
		}
		this.onEditComment({
			commentId: this.commentId
		});
	},

	onEditComment: function(args) {
		// Placeholder
	},

	_newReply: function() {
		if (this.isDisabled) {
			return;
		}
		this.onNewReply({
			replyTo: this.commentId,
			subject: "Re: " + this.subject
		});
	},

	onNewReply: function(args) {
		// Placeholder
	},

	isReply: function() {
		// summary: 
		//		Indicate if this is a reply
//		return this.depth > 0;
		return this.replyTo != "root";
	},

	isPageOwner: function() {
		// summary:
		//		Indicate if the reviewer is the page author
		return this.designerId == Runtime.userName;
	},

	appendReply: function(/*davinci.review.widgets.Comment*/ reply) {
		this.comments.push(reply);
		reply.placeAt(this.commentReplies);
		if (dojo.hasClass(this.replyRegion, "displayNone")) {
			dojo.removeClass(this.replyRegion, "displayNone");
		}
		var len = this.getReplies().length;
		this.replyCountButton.innerHTML = len + (len == 1 ? " Reply" : " Replies");
	},

	getReplies: function() {
		return this.comments;
	},

	_toggleReplies: function() {
		if (this.collapsed) {
			this.expand();
		} else {
			this.collapse();
		}
	},

	collapse: function(/*Boolean*/ all) {
		if (all) {
			var replies = this.getReplies();
			dojo.forEach(replies, function(reply) {
				reply.collapse(all);
			});
		}
		if (!this.collapsed) {
			dojo.removeClass(this.imgNode, "dijitTreeExpandoOpen");
			dojo.addClass(this.imgNode, "dijitTreeExpandoClosed");
			dojo.addClass(this.commentReplies, "displayNone");
		}
		this.collapsed = true;
	},

	expand: function(/*Boolean*/ all) {
		if (all) {
			var replies = this.getReplies();
			dojo.forEach(replies, function(reply) {
				reply.expand(all);
			});
		}
		if (this.collapsed) {
			dojo.removeClass(this.imgNode, "dijitTreeExpandoClosed");
			dojo.addClass(this.imgNode, "dijitTreeExpandoOpen");
			dojo.removeClass(this.commentReplies, "displayNone");
		}
		this.collapsed = false;
	},

	focusComment: function(evt) {
		if (this.isDisabled) {
			return;
		}
		if (this.isFocused && evt && (evt.ctrlKey || evt.metaKey)) {
			this.blurComment();
		} else {
			this.onCommentFocus(this, evt);
			dojo.addClass(this.mainBody, "commentFocused");
			this.isFocused = true;
		}
	},

	onCommentFocus: function(widget) {
		// Placeholder
	},

	blurComment: function(silent) {
		if (!silent) {
			this.onCommentBlur(this);
		}
		dojo.removeClass(this.mainBody, "commentFocused");
		this.isFocused = false;
	},

	onCommentBlur: function(widget) {
		// Placeholder
	},

	/**
	 * Fold or not the characters after a specified position of
	 * a comment. The position is specified by
	 * davinci.review.widgets.Comment.VISIBLE_PART_LENGTH.
	 * 
	 * @param comment
	 *            Object of davinci.review.widgets.Comment.
	 * @param toFold
	 *            Boolean, to fold or unfold the comment.
	 * @returns Nothing.
	 */
	_ajustLengthOfCommentContent: function(toFold) {
		var content = this.content;
		if (content.length <= this.VISIBLE_PART_LENGTH) {
			var link = dojo.query("a", this.contentNode);
			if(link.length > 0) { 
				this.contentNode.removeChild(link[0]);
			}
			return;
		}
		var linkHtml = toFold ? widgetsNls.more : widgetsNls.commentHide;

		var unfoldLink = dojo.create("a", {
			"class": "commentLinkButton",
			innerHTML: linkHtml,
			onclick: dojo.hitch(this, "_ajustLengthOfCommentContent", !toFold)
		});
		if (content) {
			if (toFold) {
				this.contentNode.innerHTML = content.substring(0, this.VISIBLE_PART_LENGTH);
			} else {
				this.contentNode.innerHTML = content;
			}
			this.contentNode.appendChild(unfoldLink);
		}
	},

	hide: function() {
		dojo.style(this.mainBody, "display", "none");
	},

	show: function() {
		dojo.style(this.mainBody, "display", "block");
		dojo.window.scrollIntoView(this.domNode);
	},

	enable: function() {
		dojo.removeClass(this.domNode, "disabled");
		dojo.removeClass(this.mainBody, "commentBodyDisabled");
		dojo.style(this.subjectNode, "color", this.color);
		dojo.style(this.ownerName, "color", this.color);
		this.isDisabled = false;
	},

	disable: function() {
		dojo.addClass(this.domNode, "disabled");
		dojo.removeAttr(this.mainBody, "style");
		dojo.addClass(this.mainBody, "commentBodyDisabled");
		dojo.style(this.subjectNode, "color", "");
		dojo.style(this.ownerName, "color", "");
		this.isDisabled = true;
	},

	getBody: function() {
		return this.mainBody;
	},
	
	/**
	 * Set current states and scenes based on comment.pageStateList and comment.viewSceneList
	 */
	setStatesScenes: function() {
		var e = davinci.Workbench.getOpenEditor(); 
		var ctx = (e && e.getContext) ? e.getContext() : null;
		var rootNode = ctx ? ctx.rootNode : null;
		var doc = rootNode && rootNode.ownerDocument;
		if(doc){
			if(this.pageStateList){
				// Go backwards so that highest-level states are set last
				for(var i=this.pageStateList.length-1; i>-0; i--){
					var o = this.pageStateList[i];
					var stateContainerNode = o.id ? doc.getElementById(o.id) : null;
					if(!stateContainerNode && o.xpath){
						var query = XPathUtils.toCssPath(o.xpath);
						stateContainerNode = doc.querySelector(query);
					}
					if(stateContainerNode){
						States.setState(o.state, stateContainerNode, { updateWhenCurrent:true });
					}
				}
			}
			if(this.viewSceneList && ctx.sceneManagers){
				for(var smIndex in this.viewSceneList){
					var sm = ctx.sceneManagers[smIndex];
					if(sm){
						var viewSceneItems = this.viewSceneList[smIndex];
						// Go backwards so that highest-level scenes are set last
						for(var j=viewSceneItems.length-1; j>=0; j--){
							var o = viewSceneItems[j];
							var sceneContainerNode = o.scId ? doc.getElementById(o.scId) : null;
							if(!sceneContainerNode && o.scXpath){
								var query = XPathUtils.toCssPath(o.scXpath);
								sceneContainerNode = doc.querySelector(query);
							}
/*FIXME: Probably should fix the signature of selectScene. If so, then this logic would be needed
							var sceneNode = o.sceneId ? doc.getElementById(o.sceneId) : null;
							if(!sceneNode && o.sceneXpath){
								var query = XPathUtils.toCssPath(o.sceneXpath);
								sceneNode = doc.querySelector(query);
							}
							if(sceneContainerNode && sceneNode){
*/
							if(sceneContainerNode && o.sceneId){
								sm.selectScene({sceneContainerNode:sceneContainerNode, sceneId:o.sceneId});
							}
						}
					}
				}
			}
		}
	}

});
});
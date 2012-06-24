define([
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"./Pane",
	"./iconUtils"
], function(declare, win, domClass, domConstruct, Pane, iconUtils){
	// module:
	//		dojox/mobile/SimpleDialog
	// summary:
	//		A dialog box for mobile.

	return declare("dojox.mobile.SimpleDialog", Pane, {
		// summary:
		//		A dialog box for mobile.
		// description:
		//		When a SimpleDialog is created, it is initially hidden and not
		//		displayed (display="none"). To show the dialog box, you need to
		//		get a reference to the widget and call the show() method.
		//
		//		The contents can be arbitrary HTML, text, or widgets. Note,
		//		however, that the widget is initially hidden. You need to be
		//		careful when you place something that cannot be initialized
		//		under the hidden state into a SimpleDialog.
		//
		//		This widget has only very little functionality, but the code
		//		size is much smaller than dijit.Dialog.

		// top: String
		//		The top edge position of the widget. If "auto", the widget is
		//		placed at the middle of the screen. Otherwise, the value
		//		(ex. "20px") is used as the top style of widget's domNode.
		top: "auto",

		// left: String
		//		The left edge position of the widget. If "auto", the widget is
		//		placed at the center of the screen. Otherwise, the value
		//		(ex. "20px") is used as the left style of widget's domNode.
		left: "auto",

		// modal: Boolean
		//		If true, a translucent cover is added over the entire page to
		//		prevent the user from interacting with elements on the page.
		modal: true,

		// closeButton: Boolean
		//		If true, a button to close the dialog box is displayed at the
		//		top-right corner.
		closeButton: false,

		// closeButtonClass: String
		//		A class name of a DOM button to be used as a close button.
		closeButtonClass: "mblDomButtonSilverCircleRedCross",

		// tabIndex: String
		//		Tabindex setting for the item so users can hit the tab key to
		//		focus on it.
		tabIndex: "0",
		_setTabIndexAttr: "", // sets tabIndex to domNode

		/* internal properties */	
		baseClass: "mblSimpleDialog",
		_cover: [], // array is to share the cover instance

		buildRendering: function(){
			this.containerNode = domConstruct.create("div", {className:"mblSimpleDialogContainer"});
			if(this.srcNodeRef){
				// reparent
				for(var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++){
					this.containerNode.appendChild(this.srcNodeRef.removeChild(this.srcNodeRef.firstChild));
				}
			}
			this.inherited(arguments);
			domClass.add(this.domNode, "mblSimpleDialogDecoration");
			this.domNode.style.display = "none";
			this.domNode.appendChild(this.containerNode);
			if(this.closeButton){
				this.closeButtonNode = domConstruct.create("div", {
					className: "mblSimpleDialogCloseBtn "+this.closeButtonClass
				}, this.domNode);
				iconUtils.createDomButton(this.closeButtonNode);
				this._clickHandle = this.connect(this.closeButtonNode, "onclick", "_onCloseButtonClick");
			}
			this._keydownHandle = this.connect(this.domNode, "onkeydown", "_onKeyDown"); // for desktop browsers
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);
			win.body().appendChild(this.domNode);
		},

		addCover: function(){
			if(!this._cover[0]){
				this._cover[0] = domConstruct.create("div", {
					className: "mblSimpleDialogCover"
				}, win.body());
			}else{
				this._cover[0].style.display = "";
			}
		},

		removeCover: function(){
			this._cover[0].style.display = "none";
		},

		_onCloseButtonClick: function(e){
			if(this.onCloseButtonClick(e) === false){ return; } // user's click action
			this.hide();
		},

		onCloseButtonClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},

		_onKeyDown: function(e){
			if(e.keyCode == 27){ // ESC
				this.hide();
			}
		},

		refresh: function(){ // TODO: should we call refresh on resize?
			var n = this.domNode;
			if(this.closeButton){
				var b = this.closeButtonNode;
				var s = Math.round(b.offsetHeight / 2);
				b.style.top = -s + "px";
				b.style.left = n.offsetWidth - s + "px";
			}
			if(this.top === "auto"){
				var h = win.global.innerHeight || win.doc.documentElement.clientHeight;
				n.style.top = Math.round((h - n.offsetHeight) / 2) + "px";
			}else{
				n.style.top = this.top;
			}
			if(this.left === "auto"){
				var h = win.global.innerWidth || win.doc.documentElement.clientWidth;
				n.style.left = Math.round((h - n.offsetWidth) / 2) + "px";
			}else{
				n.style.left = this.left;
			}
		},

		show: function(){
			if(this.domNode.style.display === ""){ return; }
			if(this.modal){
				this.addCover();
			}
			this.domNode.style.display = "";
			this.refresh();
			this.domNode.focus();
		},

		hide: function(){
			if(this.domNode.style.display === "none"){ return; }
			this.domNode.style.display = "none";
			if(this.modal){
				this.removeCover();
			}
		}
	});
});

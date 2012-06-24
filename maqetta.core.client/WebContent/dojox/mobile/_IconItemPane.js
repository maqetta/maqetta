define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"./Pane",
	"./iconUtils"
], function(declare, domConstruct, Pane, iconUtils){

	// module:
	//		dojox/mobile/_IconItemPane
	// summary:
	//		An internal widget used for IconContainer.

	return declare("dojox.mobile._IconItemPane", Pane, {
		iconPos: "",
		closeIconRole: "",
		closeIconTitle: "",
		label: "",
		closeIcon: "mblDomButtonBlueMinus",
		baseClass: "mblIconItemPane",

		// tabIndex: String
		//		Tabindex setting for the close button so users can hit the tab
		//		key to focus on it.
		tabIndex: "0",
		_setTabIndexAttr: "closeIconNode", // sets tabIndex to closeIconNode

		buildRendering: function(){
			this.inherited(arguments);
			this.hide();
			this.closeHeaderNode = domConstruct.create("h2", {className:"mblIconItemPaneHeading"}, this.domNode);
			this.closeIconNode = domConstruct.create("div", {
				className: "mblIconItemPaneIcon",
				role: this.closeIconRole,
				title: this.closeIconTitle
			}, this.closeHeaderNode);
			this.labelNode = domConstruct.create("span", {className:"mblIconItemPaneTitle"}, this.closeHeaderNode);
			this.containerNode = domConstruct.create("div", {className:"mblContent"}, this.domNode);
		},

		show: function(){
			this.domNode.style.display = "";
		},

		hide: function(){
			this.domNode.style.display = "none";
		},

		isOpen: function(e){
			return this.domNode.style.display !== "none";
		},

		_setLabelAttr: function(/*String*/text){
			this._set("label", text);
			this.labelNode.innerHTML = this._cv ? this._cv(text) : text;
		},

		_setCloseIconAttr: function(icon){
			this._set("closeIcon", icon);
			this.closeIconNode = iconUtils.setIcon(icon, this.iconPos, this.closeIconNode, null, this.closeHeaderNode);
		}
	});
});

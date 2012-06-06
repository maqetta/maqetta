define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"./iconUtils"
], function(declare, lang, domClass, domConstruct, iconUtils){
	// module:
	//		dojox/mobile/Badge
	// summary:
	//		A utility to create/update a badge node.

	return declare("dojox.mobile.Badge", null, {
		// summary:
		//		A utility to create/update a badge node.
		// description:
		//		Badge is not a widget, but just a convenient function. A badge
		//		consists of a simple DOM button. It can be created even without
		//		dojox.mobile.Badge.

		// value: String
		//		A text to show in a badge.
		value: "0",

		// className: String
		//		A class name of a DOM button.
		className: "mblDomButtonRedBadge",

		// fontSize: Number
		//		Font size in pixel. The other styles are determined by the DOM
		//		button itself.
		fontSize: 16, // [px]

		constructor: function(params, node){
			if (params){
				lang.mixin(this, params);
			}
			this.domNode = node ? node : domConstruct.create("div");
			domClass.add(this.domNode, "mblBadge");
			if(this.domNode.className.indexOf("mblDomButton") === -1){
				domClass.add(this.domNode, this.className);
			}
			if(this.fontSize !== 16){
				this.domNode.style.fontSize = this.fontSize + "px";
			}
			iconUtils.createDomButton(this.domNode);
			this.setValue(this.value);
		},

		getValue: function(){
			// summary:
			//		Returns the text shown in the badge.
			return this.domNode.firstChild.innerHTML || "";
		},

		setValue: function(/*String*/value){
			// summary:
			//		Set a label text to the badge.
			this.domNode.firstChild.innerHTML = value;
		}
	});
});
